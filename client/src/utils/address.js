const addressToString = (address) => {
  return `${address.street} ${address.houseNumber} ${address.houseAddition ? address.houseAddition : ''}, ${address.zipCode}`;
}

export { addressToString };