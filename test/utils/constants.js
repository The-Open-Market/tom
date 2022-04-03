
const ORDER_STATUSES = [
    'Pending',     /* 0  order is submitted by a client                       */
    'Approved',    /* 1  order is approved by a seller                        */
    'Accepted',    /* 2  (optional) order is accepted by a delivery service   */
    'Ready',       /* 3  order is ready for pickup                            */
    'PickedUp',    /* 4  order is picked up by a delivery service             */
    'Transferred', /* 5  order is transferred by a seller to delivery service */
    'InTransit',   /* 6  order is being delivered by the delivery service     */
    'Received',    /* 7  order is received by a client                        */
    'Delivered',   /* 8  order is delivered by a delivery service             */
    'Completed',   /* 9  order is sucessfully completed                       */
    'Cancelled',   /* 10 order is cancelled before reaching Processing status */
    'Rejected'     /* 11  order is rejected by a seller                       */
];


const SELLER_A_ZIP = "AAAA11";
const SELLER_B_ZIP = "BBBB11";
const DELIVERY_A_ZIP = "AAAA22";
const DELIVERY_B_ZIP  = "BBBB22";
const CLIENT_A_ZIP = "AAAA33";
const CLIENT_B_ZIP = "BBBB33";

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const AMOUNT = 1000;
const DELIVERY_FEE = 200;
const COLLATERAL = 300;

module.exports = {
    ORDER_STATUSES,
    SELLER_A_ZIP,
    SELLER_B_ZIP,
    DELIVERY_A_ZIP,
    DELIVERY_B_ZIP,
    CLIENT_A_ZIP,
    CLIENT_B_ZIP,
    NULL_ADDRESS,
    AMOUNT,
    DELIVERY_FEE,
    COLLATERAL,
}