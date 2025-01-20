// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

library LibRandom {
  /**
   * @notice Generate a random number between 0 and _max
   * @param  _sender The address of the sender
   * @param  _max The maximum value to return
   * @return r Random value
   */
  function random(address _sender, uint256 _max) internal view returns (uint256 r) {
    require(_max > 0, "Max must be greater than 0");
    r =
      uint256(
        keccak256(
          abi.encodePacked(
            _sender,
            block.prevrandao,
            block.timestamp,
            block.coinbase,
            gasleft() // Remaining gas
          )
        )
      ) %
      _max;
  }
}
