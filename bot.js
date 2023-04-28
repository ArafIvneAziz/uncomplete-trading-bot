const Binance = require('binance-api-node').default;
const client = Binance({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

const symbol = 'BTCUSDT';
const quantity = 0.01; // adjust to your desired quantity
const buyPrice = 60000; // adjust to your desired buy price
const stopLossPercentage = 1; // adjust to your desired stop loss percentage
const sellPercentage = 3.5; // adjust to your desired sell percentage

// Place buy order
client.futuresOrder({
  symbol,
  side: 'BUY',
  type: 'LIMIT',
  quantity,
  price: buyPrice,
}).then((buyOrder) => {
  console.log('Buy order placed:', buyOrder);

  // Place stop loss order
  const stopPrice = buyPrice * (1 - stopLossPercentage / 100);
  client.futuresOrder({
    symbol,
    side: 'SELL',
    type: 'STOP_MARKET',
    quantity,
    stopPrice,
  }).then((stopLossOrder) => {
    console.log('Stop loss order placed:', stopLossOrder);
  });

  // Place limit sell order
  const sellPrice = buyPrice * (1 + sellPercentage / 100);
  client.futuresOrder({
    symbol,
    side: 'SELL',
    type: 'LIMIT',
    quantity,
    price: sellPrice,
  }).then((limitSellOrder) => {
    console.log('Limit sell order placed:', limitSellOrder);
  });
});
const checkPriceInterval = setInterval(() => {
    client.futuresTicker({
      symbol,
    }).then((ticker) => {
      const currentPrice = parseFloat(ticker.lastPrice);
      const newStopPrice = buyPrice * (1 - (stopLossPercentage - 0.12) / 100);
      if (currentPrice >= buyPrice * (1 + 0.01) && newStopPrice > stopPrice) {
        // Update stop loss order
        client.futuresCancelOrder({
          symbol,
          orderId: stopLossOrder.orderId,
        }).then(() => {
          client.futuresOrder({
            symbol,
            side: 'SELL',
            type: 'STOP_MARKET',
            quantity,
            stopPrice: newStopPrice,
          }).then((newStopLossOrder) => {
            console.log('Stop loss order updated:', newStopLossOrder);
            stopPrice = newStopPrice;
            stopLossOrder = newStopLossOrder;
          });
        });
      }
  
      const newSellPrice = buyPrice * (1 + (sellPercentage - 0.21) / 100);
      if (currentPrice >= buyPrice * (1 + 0.015) && newSellPrice > sellPrice) {
        // Update limit sell order
        client.futuresCancelOrder({
          symbol,
          orderId: limitSellOrder.orderId,
        }).then(() => {
          client.futuresOrder({
            symbol,
            side: 'SELL',
            type: 'LIMIT',
            quantity,
            price: newSellPrice,
          }).then((newLimitSellOrder) => {
            console.log('Limit sell order updated:', newLimitSellOrder);
            sellPrice = newSellPrice;
            limitSellOrder = newLimitSellOrder;
          });
        });
      }
    });
  }, 10000); // adjust interval to your desired frequency (in milliseconds)
  client.futuresExchangeInfo().then((exchangeInfo) => {
    const currentTimestamp = Date.now();
    const futureSymbols = exchangeInfo.symbols.filter((symbol) => {
      return symbol.contractType === 'PERPETUAL' || new Date(symbol.expiryDate) > currentTimestamp;
    }).map((symbol) => symbol.symbol);
  
    console.log('Available future symbols:', futureSymbols);
  });
  