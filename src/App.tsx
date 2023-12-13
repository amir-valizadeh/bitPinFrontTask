import React, { useState, useEffect } from "react";
import "./App.css";

import { w3cwebsocket as W3CWebSocket } from "websocket";
import Card from "./components/Cards.component";

function App() {
  const [firstData, setFirstData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;
  const arrayToPaginate = firstData;

  const totalPages = Math.ceil(arrayToPaginate.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const itemsOnPage = arrayToPaginate.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const client = new W3CWebSocket("wss://ws.bitpin.ir");

  // Create a map to store card data with market_id as the key
  const cardDataMap: { [key: string]: any } = {};

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const response = await fetch("https://api.bitpin.ir/v1/mkt/markets/");

        if (response.ok) {
          const json = await response.json();
          setFirstData([...json.results]);
          console.log(firstData);
          // Initialize cardDataMap with market_id as the key
        } else {
          console.error("API error");
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchMarkets();
  }, []);
  console.log(cardDataMap);
  useEffect(() => {
    // Subscribe to price info when the component mounts
    client.onopen = () => {
      //console.log("WebSocket connection established.");
      subscribeToPriceInfo();
    };

    // Handle messages received from the WebSocket
    client.onmessage = (event) => {
      //console.log(event);
      const message = JSON.parse(event.data);
      // console.log(message);
      // Check if the received message is a currency price update
      const firstDataCopy = firstData;
      Object.keys(message).forEach((key) => {
        const foundIndex = firstDataCopy.findIndex((item) => item.id == key);
        if (foundIndex > -1) {
          firstDataCopy[foundIndex] = {
            ...firstDataCopy[foundIndex],
            price_info: {
              ...firstDataCopy[foundIndex].price_info,
              ...message[key],
            },
          };
        }
      });
      setFirstData(firstDataCopy);

      //setFirstData([...Object.values(cardDataMapCopy)]);

      // Update the card data in cardDataMap based on market_id
    };

    // Handle WebSocket errors
    client.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Handle WebSocket close event
    client.onclose = (event) => {
      if (event.code === 1000) {
        console.log("WebSocket connection closed cleanly.");
      } else {
        console.error("WebSocket connection closed with code:", event.code);
      }
    };
  }, []);

  // Function to subscribe to price info
  const subscribeToPriceInfo = () => {
    const subscriptionMessage = {
      method: "sub_to_price_info",
    };
    client.send(JSON.stringify(subscriptionMessage));
  };

  return (
    <>
      <div>
        {itemsOnPage.length > 0 ? (
          <>
            <div className="card-container">
              {itemsOnPage.map((item, index) => (
                <Card key={index} item={item} marketId={item.market_id} />
              ))}
            </div>
            <div>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                Previous Page
              </button>
              <span>
                {" "}
                Page {currentPage} of {totalPages}{" "}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>
                Next Page
              </button>
            </div>
          </>
        ) : (
          <p>No items to display on this page.</p>
        )}
      </div>
    </>
  );
}

export default App;
