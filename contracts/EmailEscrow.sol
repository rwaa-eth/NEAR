// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Holds an ERC-20 for an email that may not have a wallet yet.
/// The payer calls deposit. The server operator releases once that email registers.
/// After CLAIM_PERIOD the payer can reclaim an uncollected deposit.
/// emailHash is keccak256 of the lowercase email, with no length prefix.
/// Open deposits for one hash sit in an array. Release pays them all at once.
/// Reclaim removes one entry by swapping it with the last and popping.
contract EmailEscrow {
    uint256 public constant CLAIM_PERIOD = 7 days;

    address public operator;
    IERC20 public immutable token;
    uint256 public nextDepositId;

    struct Deposit {
        uint256 id;
        address from;
        uint256 amount;
        uint64 unlockAt;
    }

    mapping(bytes32 => Deposit[]) private depositsByEmail;

    event Deposited(
        uint256 indexed depositId,
        bytes32 indexed emailHash,
        address indexed from,
        uint256 amount,
        uint64 unlockAt
    );
    event Released(uint256 indexed depositId, bytes32 indexed emailHash, address indexed to, uint256 amount);
    event Reclaimed(uint256 indexed depositId, address indexed to, uint256 amount);
    event OperatorUpdated(address indexed operator);

    error NotOperator();
    error NotSender();
    error ZeroAmount();
    error ZeroAddress();
    error NothingPending();
    error StillLocked();
    error TransferFailed();

    constructor(address token_, address operator_) {
        if (token_ == address(0) || operator_ == address(0)) revert ZeroAddress();
        token = IERC20(token_);
        operator = operator_;
    }

    function setOperator(address next) external {
        if (msg.sender != operator) revert NotOperator();
        if (next == address(0)) revert ZeroAddress();
        operator = next;
        emit OperatorUpdated(next);
    }

    function getDeposits(bytes32 emailHash) external view returns (Deposit[] memory) {
        return depositsByEmail[emailHash];
    }

    /// @notice Lock tokens for an email. The caller must approve this contract first.
    function deposit(bytes32 emailHash, uint256 amount) external returns (uint256 depositId) {
        if (amount == 0) revert ZeroAmount();
        _call(address(token), abi.encodeCall(IERC20.transferFrom, (msg.sender, address(this), amount)));
        depositId = nextDepositId;
        unchecked {
            nextDepositId = depositId + 1;
        }
        uint64 unlockAt = uint64(block.timestamp + CLAIM_PERIOD);
        depositsByEmail[emailHash].push(
            Deposit({id: depositId, from: msg.sender, amount: amount, unlockAt: unlockAt})
        );
        emit Deposited(depositId, emailHash, msg.sender, amount, unlockAt);
    }

    /// @notice Send every open deposit for an email to the registered wallet, in one transfer.
    function release(bytes32 emailHash, address to) external {
        if (msg.sender != operator) revert NotOperator();
        if (to == address(0)) revert ZeroAddress();
        Deposit[] storage rows = depositsByEmail[emailHash];
        uint256 count = rows.length;
        if (count == 0) revert NothingPending();
        uint256 total;
        for (uint256 i = 0; i < count; ) {
            total += rows[i].amount;
            emit Released(rows[i].id, emailHash, to, rows[i].amount);
            unchecked {
                ++i;
            }
        }
        delete depositsByEmail[emailHash];
        _call(address(token), abi.encodeCall(IERC20.transfer, (to, total)));
    }

    /// @notice After CLAIM_PERIOD, the original payer can pull one uncollected deposit back.
    function reclaim(bytes32 emailHash, uint256 depositId) external {
        Deposit[] storage rows = depositsByEmail[emailHash];
        uint256 count = rows.length;
        uint256 index = count;
        for (uint256 i = 0; i < count; ) {
            if (rows[i].id == depositId) {
                index = i;
                break;
            }
            unchecked {
                ++i;
            }
        }
        if (index == count) revert NothingPending();
        Deposit memory item = rows[index];
        if (msg.sender != item.from) revert NotSender();
        if (block.timestamp < item.unlockAt) revert StillLocked();
        uint256 last = count - 1;
        if (index != last) rows[index] = rows[last];
        rows.pop();
        _call(address(token), abi.encodeCall(IERC20.transfer, (msg.sender, item.amount)));
        emit Reclaimed(depositId, msg.sender, item.amount);
    }

    function _call(address target, bytes memory data) private {
        (bool ok, bytes memory ret) = target.call(data);
        if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) revert TransferFailed();
    }
}
