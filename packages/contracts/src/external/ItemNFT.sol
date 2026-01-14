// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

/**
 * @title ItemNFT
 * @dev ERC721 contract for exporting in-game items as NFTs.
 * Stores the item's entity ID (for re-importing) and name/value (for external display).
 * Only the ratfun namespace systems can mint/burn tokens.
 * Extends ERC721Enumerable to allow querying owned tokens.
 */
contract ItemNFT is ERC721Enumerable {
  /// @notice Counter for generating unique token IDs
  uint256 private _nextTokenId;

  /// @notice Maps token ID to the item's MUD entity ID
  mapping(uint256 => bytes32) public itemIds;

  /// @notice On-chain storage for item names (for external display)
  mapping(uint256 => string) public itemNames;

  /// @notice On-chain storage for item values (for external display)
  mapping(uint256 => uint256) public itemValues;

  /// @notice Emitted when an item is exported to NFT
  event ItemExported(
    uint256 indexed tokenId,
    address indexed owner,
    bytes32 indexed itemId,
    string name,
    uint256 value
  );

  /// @notice Emitted when an NFT is imported back to the game
  event ItemImported(uint256 indexed tokenId, address indexed owner, bytes32 indexed itemId);

  constructor(IBaseWorld _world) ERC721("RAT.FUN PSYCHO OBJECT", "PSYOBJ") {
    StoreSwitch.setStoreAddress(address(_world));
  }

  modifier onlyNamespace(bytes14 namespace) {
    require(ResourceAccess.get(WorldResourceIdLib.encodeNamespace(namespace), msg.sender), "no namespace access");
    _;
  }

  /**
   * @notice Mint a new item NFT
   * @dev Only callable by systems with ratfun namespace access
   * @param to Address to mint to
   * @param itemId The item's MUD entity ID
   * @param name Item name (for external display)
   * @param value Item value (for external display)
   * @return tokenId The minted token ID
   */
  function mint(
    address to,
    bytes32 itemId,
    string calldata name,
    uint256 value
  ) external onlyNamespace("ratfun") returns (uint256 tokenId) {
    tokenId = _nextTokenId++;
    _mint(to, tokenId);
    itemIds[tokenId] = itemId;
    itemNames[tokenId] = name;
    itemValues[tokenId] = value;
    emit ItemExported(tokenId, to, itemId, name, value);
  }

  /**
   * @notice Burn an NFT (for import back to game)
   * @dev Only callable by systems with ratfun namespace access
   * @param tokenId Token ID to burn
   * @return itemId The item's MUD entity ID
   */
  function burn(uint256 tokenId) external onlyNamespace("ratfun") returns (bytes32 itemId) {
    address owner = ownerOf(tokenId);
    itemId = itemIds[tokenId];

    _burn(tokenId);

    // Clear storage
    delete itemIds[tokenId];
    delete itemNames[tokenId];
    delete itemValues[tokenId];

    emit ItemImported(tokenId, owner, itemId);
  }

  /**
   * @notice Get the item entity ID for a token
   * @param tokenId Token ID
   * @return itemId The item's MUD entity ID
   */
  function getItemId(uint256 tokenId) external view returns (bytes32 itemId) {
    require(ownerOf(tokenId) != address(0), "token does not exist");
    return itemIds[tokenId];
  }

  /**
   * @notice Get item data for a token (for external display)
   * @param tokenId Token ID
   * @return name Item name
   * @return value Item value
   */
  function getItemData(uint256 tokenId) external view returns (string memory name, uint256 value) {
    require(ownerOf(tokenId) != address(0), "token does not exist");
    return (itemNames[tokenId], itemValues[tokenId]);
  }

  /**
   * @notice Returns the on-chain metadata URI for a token
   * @param tokenId Token ID
   * @return URI with base64-encoded JSON metadata
   */
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(ownerOf(tokenId) != address(0), "token does not exist");

    string memory name = itemNames[tokenId];
    uint256 value = itemValues[tokenId];

    // Generate SVG image
    string memory svg = _generateSVG(name, value);
    string memory svgBase64 = Base64.encode(bytes(svg));

    // Build JSON metadata
    string memory json = string(
      abi.encodePacked(
        '{"name":"',
        name,
        '","description":"A Psycho Object from RAT.FUN - import back to the game at rat.fun","image":"data:image/svg+xml;base64,',
        svgBase64,
        '","attributes":[{"trait_type":"Value","value":',
        Strings.toString(value),
        "}]}"
      )
    );

    return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
  }

  /**
   * @notice Generates an SVG image for the item
   * @param name Item name
   * @param value Item value
   * @return SVG string
   */
  function _generateSVG(string memory name, uint256 value) internal pure returns (string memory) {
    string memory color = _getRarityColor(value);

    // Build SVG in parts to avoid stack too deep
    bytes memory part1 = abi.encodePacked(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
      '<rect width="400" height="400" fill="#0a0a0a"/>',
      '<rect x="20" y="20" width="360" height="360" fill="',
      color,
      '" rx="20"/>',
      '<rect x="30" y="30" width="340" height="340" fill="#1a1a1a" rx="15"/>'
    );

    bytes memory part2 = abi.encodePacked(
      '<text x="200" y="100" text-anchor="middle" fill="#666" font-family="monospace" font-size="14">RAT.FUN</text>',
      '<text x="200" y="200" text-anchor="middle" fill="#fff" font-family="serif" font-size="24">',
      name,
      "</text>",
      '<text x="200" y="300" text-anchor="middle" fill="',
      color,
      '" font-family="monospace" font-size="20">',
      Strings.toString(value),
      "</text>",
      "</svg>"
    );

    return string(abi.encodePacked(part1, part2));
  }

  function _getRarityColor(uint256 value) internal pure returns (string memory) {
    if (value >= 100) return "#9333ea";
    if (value >= 50) return "#eab308";
    if (value >= 20) return "#9ca3af";
    return "#b45309";
  }
}
