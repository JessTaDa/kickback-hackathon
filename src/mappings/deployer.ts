import { EthereumBlock, EthereumCall, Bytes, BigInt, log } from "@graphprotocol/graph-ts"
import { DeployCall } from '../../generated/Deployer/Deployer'
import { NewParty, OwnershipTransferred } from "../../generated/Deployer/Deployer"
import { PartyEntity, MetaEntity, OwnershipTransferredEntity } from "../../generated/schema"
import {
  Party as PartyContract,
} from "../../generated/templates"
import {
  Party as PartyBindingContract,
} from "../../generated/templates/Party/Party"

export function handleNewParty(event: NewParty): void {
  log.warning(
    '*** 1 Block number: {}, block hash: {}, transaction hash: {}',
    [
      event.block.number.toString(),       // "47596000"
      event.block.hash.toHexString(),      // "0x..."
      event.transaction.hash.toHexString() // "0x..."
    ]
  );

  // Creating dynamic source
  PartyContract.create(event.params.deployedAddress)
  let party = PartyBindingContract.bind(event.params.deployedAddress)
  let limitOfParticipants = party.limitOfParticipants().toI32()
  let newEntity = new PartyEntity(event.params.deployedAddress.toHex())
  newEntity.save()

  let meta = MetaEntity.load('')
  if(meta){
    meta.numParties = meta.numParties + 1
    meta.numMoneyTransactions =  meta.numMoneyTransactions + 1
    meta.limitOfParticipants = meta.limitOfParticipants + limitOfParticipants
  }else{
    meta = new MetaEntity('')
    meta.numParties = 1
    meta.numMoneyTransactions = 0
    meta.limitOfParticipants = limitOfParticipants
  }
  meta.save()
  // UpdateParticipantLimit
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let id = event.transaction.hash.toHex()
  let OwnershipTransfer = new OwnershipTransferredEntity(id)
  OwnershipTransfer.senderAddress = event.params.previousOwner.toHex() as Bytes | null
  OwnershipTransfer.recipientAddress = event.params.newOwner.toHex() as Bytes | null
  OwnershipTransfer.amount = event.transaction.hash.toHexString() as BigInt | null
  OwnershipTransfer.timestamp = event.block.timestamp
  OwnershipTransfer.save()
}
