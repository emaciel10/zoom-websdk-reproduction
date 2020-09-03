// SAMPLE ZOOM WEB SDK CODE JUST TO ILLUSTRATE HOW WE ARE USING THIS IN PRACTICE

import React, { useEffect } from "react";

import { ZoomMtg } from "@zoomus/websdk";
import {
  apolloClient,
  withApolloClient,
} from "/imports/src/client/apollo/apollo-client";
import useQueryParam from "/imports/src/client/redux/redux-router/useQueryParam";
import { GET_ZOOM_MEETING_DATA } from "../../apollo/zoom/graphql";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

const joinZoomMeeting = async (meetingNumber) => {
  const result = await apolloClient.query({
    query: GET_ZOOM_MEETING_DATA,
    variables: { meetingNumber },
  });

  const { signature, apiKey } = result.data.getZoomMeetingInfo;
  // pull user data from query, note user might not be logged in
  // so they may be a 'guest' user
  const { username = "Guest" } = result.data.user || {};

  ZoomMtg.init({
    leaveUrl: window.location.origin,
    success() {
      ZoomMtg.join({
        apiKey,
        meetingNumber: parseInt(meetingNumber, 10),
        userName: username,
        passWord: "",
        signature,
        success() {
          console.log("join meeting success");
        },
        error(res) {
          console.log(res);
        },
      });
    },
    error(res) {
      console.log("Error on zoom init", res);
    },
  });
};

function ZoomRoot() {
  const meetingNumber = useQueryParam("meetingNumber");

  useEffect(() => {
    if (meetingNumber) {
      joinZoomMeeting(meetingNumber);
    } else if (window.parent) {
      window.parent.postMessage("close-zoom", "*");
    }
  }, [meetingNumber]);

  return <div className="zoom-root" />;
}

export default withApolloClient(ZoomRoot);
