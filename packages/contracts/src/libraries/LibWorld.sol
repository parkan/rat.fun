// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
  GameConfig,
  GamePercentagesConfig,
  GamePercentagesConfigData,
  GameConfigData,
  ExternalAddressesConfig,
  ExternalAddressesConfigData,
  Name,
  WorldEvent,
  WorldEventData,
  ChallengeConfig
} from "../codegen/index.sol";
import {
  RAT_CREATION_COST,
  MAX_TRIP_PROMPT_LENGTH,
  MIN_TRIP_PROMPT_LENGTH,
  MAX_INVENTORY_SIZE,
  COOLDOWN_CLOSE_TRIP,
  MAX_VALUE_PER_WIN_PERCENTAGE,
  MIN_RAT_VALUE_TO_ENTER_PERCENTAGE,
  TAXATION_LIQUIDATE_RAT_PERCENTAGE,
  TAXATION_CLOSE_TRIP_PERCENTAGE,
  RATS_KILLED_FOR_ADMIN_ACCESS,
  CHALLENGE_MIN_CREATION_COST,
  CHALLENGE_ACTIVE_PERIOD_BLOCKS
} from "../constants.sol";
import { LibUtils } from "./LibUtils.sol";
import { GamePool } from "../external/GamePool.sol";

library LibWorld {
  /**
   * @notice Set game config and create tutorial orders
   * @param _adminAddress The address of the admin
   * @param erc20Address The address of the erc20 token
   * @param gamePoolAddress The address of the game pool
   * @param serviceAddress The address of the service
   * @param feeAddress The address of the fee account
   */
  function init(
    address _adminAddress,
    address erc20Address,
    address gamePoolAddress,
    address serviceAddress,
    address feeAddress
  ) internal {
    bytes32 adminId = LibUtils.addressToEntityKey(_adminAddress);

    // Set game config
    GameConfig.set(
      GameConfigData({
        adminAddress: _adminAddress,
        adminId: adminId,
        ratCreationCost: RAT_CREATION_COST,
        maxInventorySize: MAX_INVENTORY_SIZE,
        maxTripPromptLength: MAX_TRIP_PROMPT_LENGTH,
        cooldownCloseTrip: COOLDOWN_CLOSE_TRIP,
        ratsKilledForAdminAccess: RATS_KILLED_FOR_ADMIN_ACCESS
      })
    );

    GamePercentagesConfig.set(
      GamePercentagesConfigData({
        maxValuePerWin: MAX_VALUE_PER_WIN_PERCENTAGE,
        minRatValueToEnter: MIN_RAT_VALUE_TO_ENTER_PERCENTAGE,
        taxationLiquidateRat: TAXATION_LIQUIDATE_RAT_PERCENTAGE,
        taxationCloseTrip: TAXATION_CLOSE_TRIP_PERCENTAGE
      })
    );

    ExternalAddressesConfig.set(
      ExternalAddressesConfigData({
        erc20Address: erc20Address,
        gamePoolAddress: gamePoolAddress,
        mainSaleAddress: address(0),
        serviceAddress: serviceAddress,
        feeAddress: feeAddress
      })
    );

    // Set challenge config
    ChallengeConfig.set(CHALLENGE_MIN_CREATION_COST, CHALLENGE_ACTIVE_PERIOD_BLOCKS);

    // Set admin name
    Name.set(adminId, "RATKING");
    // Approve game pool to spend admin's tokens
    erc20().approve(address(gamePool()), type(uint256).max);
  }

  /**
   * @notice Set a world event
   * @param _cmsId The id of the world event in the CMS
   * @param _title The title of the world event
   * @param _prompt The prompt for the world event
   * @param _durationInBlocks The duration of the world event in blocks
   */
  function setWorldEvent(
    string memory _cmsId,
    string memory _title,
    string memory _prompt,
    uint256 _durationInBlocks
  ) internal {
    WorldEvent.set(
      WorldEventData({
        cmsId: _cmsId,
        title: _title,
        prompt: _prompt,
        creationBlock: block.number,
        expirationBlock: block.number + _durationInBlocks
      })
    );
  }

  /**
   * @notice Remove the world event
   */
  function removeWorldEvent() internal {
    WorldEvent.set(WorldEventData({ cmsId: "", title: "", prompt: "", creationBlock: 0, expirationBlock: 0 }));
  }

  /**
   * @notice Get the erc20 token contract used by the world
   */
  function erc20() internal view returns (ERC20) {
    return ERC20(ExternalAddressesConfig.getErc20Address());
  }

  /**
   * @notice Get the game pool contract used by the world
   */
  function gamePool() internal view returns (GamePool) {
    return GamePool(ExternalAddressesConfig.getGamePoolAddress());
  }
}
