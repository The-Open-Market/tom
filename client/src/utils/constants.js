const sellerData = {
  address: '0x59Ce492d182688239C118AcFEb1A4872Ce3B1231',
  keys: {
    public: 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=',
    private: 'z6bXpb5tnHlTc/B9N53ig455/o0lX3eienBkcHbNLeM=',
  },
};

const clientData = {
  keys: {
    symmetric: 'KXj1DmMm6caFY1ioIyBIy6Ovs1tCjFuj8yEXZgysSCk=',
    public: '4wkgmg8X2ScQHGz1vaqnDGEpb7n1yeE1OG/s8rvIrH8=',
    private: 'DWGOwvvKMKEW4+Fyd9JUdOcDJzJ/pQlElKhTWOEptWg=',
  },
};

const orderDefaults = {
  defaultDeliveryFee: 2.5,
  defaultCollateralPercentage: 0.5
};

const GAS_LIMIT = 1000000;

export { sellerData, clientData, orderDefaults, GAS_LIMIT };
