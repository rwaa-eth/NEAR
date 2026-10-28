// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Holds an ERC-20 for an email that may not have a wallet yet.
/// The payer calls deposit. The server operator calls release once that email has registered.
/// emailHash is keccak256 of the lowercase email, with no length prefix.
contract EmailEscrow {
    address public operator;
    IERC20 public immutable token;

    mapping(bytes32 => uint256) public pending;

    event Deposited(bytes32 indexed emailHash, address indexed from, uint256 amount);
    event Released(bytes32 indexed emailHash, address indexed to, uint256 amount);
    event OperatorUpdated(address indexed operator);

    error NotOperator();
    error ZeroAmount();
    error ZeroAddress();
    error NothingPending();
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
    function deposit(bytes32 emailHash, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        _call(address(token), abi.encodeCall(IERC20.transferFrom, (msg.sender, address(this), amount)));
        pending[emailHash] += amount;
        emit Deposited(emailHash, msg.sender, amount);
    }

    /// @notice Send the full pending balance to the wallet registered for that email.
    function release(bytes32 emailHash, address to) external {
        if (msg.sender != operator) revert NotOperator();
        if (to == address(0)) revert ZeroAddress();
        uint256 amount = pending[emailHash];
        if (amount == 0) revert NothingPending();
        pending[emailHash] = 0;
        _call(address(token), abi.encodeCall(IERC20.transfer, (to, amount)));
        emit Released(emailHash, to, amount);
    }

    /// @dev Accepts both standard ERC-20 (returns true) and tokens that return no data.
    function _call(address target, bytes memory data) private {
        (bool ok, bytes memory ret) = target.call(data);
        if (!ok || (ret.length != 0 && !abi.decode(ret, (bool)))) revert TransferFailed();
    }
}
