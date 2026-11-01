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
contract EmailEscrow {
    uint256 public constant CLAIM_PERIOD = 7 days;

    address public operator;
    IERC20 public immutable token;
    uint256 public nextDepositId;

    struct Deposit {
        bytes32 emailHash;
        address from;
        uint256 amount;
        uint64 unlockAt;
        bool closed;
    }

    mapping(uint256 => Deposit) public deposits;
    mapping(bytes32 => uint256) public pending;

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
    error AlreadyClosed();
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

    /// @notice Lock tokens for an email. The caller must approve this contract first.
    function deposit(bytes32 emailHash, uint256 amount) external returns (uint256 depositId) {
        if (amount == 0) revert ZeroAmount();
        _call(address(token), abi.encodeCall(IERC20.transferFrom, (msg.sender, address(this), amount)));
        depositId = nextDepositId;
        unchecked {
            nextDepositId = depositId + 1;
        }
        uint64 unlockAt = uint64(block.timestamp + CLAIM_PERIOD);
        deposits[depositId] = Deposit({
            emailHash: emailHash,
            from: msg.sender,
            amount: amount,
            unlockAt: unlockAt,
            closed: false
        });
        pending[emailHash] += amount;
        emit Deposited(depositId, emailHash, msg.sender, amount, unlockAt);
    }

    /// @notice Send every open deposit for an email to the registered wallet.
    function release(bytes32 emailHash, address to) external {
        if (msg.sender != operator) revert NotOperator();
        if (to == address(0)) revert ZeroAddress();
        uint256 left = pending[emailHash];
        if (left == 0) revert NothingPending();
        pending[emailHash] = 0;
        uint256 end = nextDepositId;
        for (uint256 id = 0; id < end; ) {
            Deposit storage item = deposits[id];
            if (!item.closed && item.emailHash == emailHash) {
                uint256 amount = item.amount;
                item.closed = true;
                item.amount = 0;
                _call(address(token), abi.encodeCall(IERC20.transfer, (to, amount)));
                emit Released(id, emailHash, to, amount);
            }
            unchecked {
                id += 1;
            }
        }
    }

    /// @notice After CLAIM_PERIOD, the original payer can pull an uncollected deposit back.
    function reclaim(uint256 depositId) external {
        Deposit storage item = deposits[depositId];
        if (item.from == address(0) || item.amount == 0) revert NothingPending();
        if (item.closed) revert AlreadyClosed();
        if (msg.sender != item.from) revert NotSender();
        if (block.timestamp < item.unlockAt) revert StillLocked();
        uint256 amount = item.amount;
        bytes32 hash = item.emailHash;
        item.closed = true;
        item.amount = 0;
        pending[hash] -= amount;
        _call(address(token), abi.encodeCall(IERC20.transfer, (msg.sender, amount)));
        emit Reclaimed(depositId, msg.sender, amount);
    }

    function _call(address target, bytes memory data) private {
        (bool ok, bytes memory ret) = target.call(data);
        if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) revert TransferFailed();
    }
}
