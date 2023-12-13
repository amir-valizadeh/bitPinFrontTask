import React, { useState, useEffect } from "react";
import "./App.css";

import { w3cwebsocket as W3CWebSocket } from "websocket";
import Card from "./components/Cards.component";

function App() {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [marketDataArray, setMarketDataArray] = useState<any[]>([]);

  //pagination info goes here
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;
  const arrayToPaginate = marketDataArray;

  const totalPages = Math.ceil(arrayToPaginate.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const itemsOnPage = arrayToPaginate.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const client = new W3CWebSocket("wss://ws.bitpin.ir");

  // Create a map to store card data

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const response = await fetch("https://api.bitpin.ir/v1/mkt/markets/");

        if (response.ok) {
          const json = await response.json();
          setMarketDataArray([...json.results]);
    
        } else {
          console.error("API error");
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchMarkets();
  }, []);


  useEffect(() => {
    // Subscribe to price info when the component mounts
    client.onopen = () => {
      const subscriptionMessage = {
        method: "sub_to_price_info",
      };
      client.send(JSON.stringify(subscriptionMessage));
    };

    // Handle messages received from the WebSocket
    client.onmessage = (event) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const message = JSON.parse(event.data);

      if (typeof message === "object") {
        if (typeof message.message === "string") {
          console.log("message.message");
        } else {
          setMarketDataArray((prev) => {
            const marketDataArrayCopy = [...prev];


            Object.keys(message).map((key) => {
              const foundIndex = marketDataArrayCopy.findIndex((d) => d.id == key);

              if (foundIndex > -1) {
                marketDataArrayCopy[foundIndex] = {
                  ...marketDataArrayCopy[foundIndex],
                  price_info: {
                    ...marketDataArrayCopy[foundIndex].price_info,
                    ...message[Number(key)],
                  },
                };
              }
            });

            return marketDataArrayCopy;
          });
        }
      }
    };

    
    client.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    
    client.onclose = (event) => {
      if (event.code === 1000) {
        console.log("WebSocket connection closed cleanly.");
      } else {
        console.error("WebSocket connection closed with code:", event.code);
      }
    };
  }, [client]);

  return (
    <>
      <div>
        {itemsOnPage.length > 0 ? (
          <>
            <div className="card-container">
              {itemsOnPage.map((item, index) => (
                <Card key={index} item={item}  />
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
          <h1>No items to display on this page please wait :)</h1>
        )}
      </div>
    </>
  );
}

export default App;
