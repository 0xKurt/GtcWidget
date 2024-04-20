import React, { useState, useEffect } from "react";

export const GtcWidget = (props) => {
  const [applications, setApplications] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date().toISOString().replace(/\.\d+Z$/, "Z"); // Get current UTC timestamp
      const projectId = props.projectId;

      try {
        const response = await fetch(
          "https://indexer-staging.fly.dev/graphql",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `query ApplicationQuery {
                        applications(filter: {
                          projectId: {equalTo: "${projectId}"}
                          round: {
                            donationsStartTime: {lessThan: "${now}"}
                            donationsEndTime: {greaterThan: "${now}"}
                          }
                        }) {
                          id
                          project {
                            id
                            name
                            anchorAddress
                          }
                          round {
                            chainId
                            id
                            roundMetadata
                          }
                        }
                      }`,
              variables: null,
              operationName: "ApplicationQuery",
            }),
          },
        );
        const data = await response.json();
        if (data?.data?.applications?.length > 0) {
          setApplications(data.data.applications);
          setSelectedApplication(0);
        }

        console.log("Data fetched:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (props.projectId) fetchData();
  }, [props.projectId]);

  return (
    <div
      style={{ padding: 5, width: 250, height: 80, backgroundColor: "white" }}
    >
      <select
        style={{ width: "100%", padding: "2px", borderRadius: "10px" }}
        onChange={(e) => {
          const selectedIndex = e.target.value;
          setSelectedApplication(selectedIndex);
        }}
      >
        {applications?.length > 0 ? (
          applications.map((application, index) => (
            <option key={index} value={index}>
              {application.round.roundMetadata.name.slice(0, 26) + "..."}
            </option>
          ))
        ) : (
          <option>Loading application data...</option>
        )}
      </select>
      <div
        style={{
          backgroundColor: "gray",
          color: "white",
          width: "100%",
          padding: "1px",
          borderRadius: "10px",
          textAlign: "center",
          cursor: "pointer",
          marginTop: "2px",
        }}
        onClick={() => {
          const app = applications[selectedApplication];
          const round = app.round;
          window.open(
            `https://explorer.gitcoin.co/#/round/${round.chainId}/${round.id}/${app.id}`,
            "_blank",
          );
        }}
      >
        <div style={{ fontSize: "small" }}>Donate on</div>
        <div style={{ fontSize: "large" }}>Gitcoin</div>
      </div>
    </div>
  );
};
