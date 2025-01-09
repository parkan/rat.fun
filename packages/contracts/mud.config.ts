import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "ratroom",
  enums: {
    ENTITY_TYPE: ["NONE", "PLAYER", "RAT", "ROOM", "ITEM", "TRAIT", ],
  },
  deploy: {
    upgradeableWorldImplementation: true,
  },
  tables: {
    Name: "string",
    EntityType: "ENTITY_TYPE",
    Currency: "uint256",
    Health: "uint256",
    Energy: "uint256",
    Trait: "string",
    OwnedRat: "bytes32",
    Owner: "bytes32",
  },
  modules: [
    {
      artifactPath: "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json",
      root: true,
      args: [],
    },
    {
      artifactPath: "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
      root: true,
      args: [],
    }
  ],
});
