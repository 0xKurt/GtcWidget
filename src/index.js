import React, { useState, useEffect } from "react";

export const GtcWidget = (props) => {
  const [applications, setApplications] = useState(null);

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
        if (data?.data?.applications?.length > 0)
          setApplications(data.data.applications);

        console.log("Data fetched:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (props.projectId) fetchData();
  }, [props.projectId]);

  return (
    <div>
      {applications?.length > 0 ? (
        <p>Project ID: {applications[0].project.id}</p>
      ) : (
        <p>Loading application data...</p>
      )}
    </div>
  );
};
