"use client";
import React, { useEffect, useState } from "react";

interface Props {
  postedAtTime: string;
}

const TimeAgo: React.FC<Props> = ({ postedAtTime }) => {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const calculateTimeAgo = () => {
      const currentTime = new Date();
      const postedTime = new Date(postedAtTime);
      const differenceInSeconds = Math.floor(
        (currentTime.getTime() - postedTime.getTime()) / 1000
      );

      if (differenceInSeconds < 60) {
        setTimeAgo(`${differenceInSeconds} seconds ago`);
      } else if (differenceInSeconds < 3600) {
        const minutes = Math.floor(differenceInSeconds / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
      } else if (differenceInSeconds < 86400) {
        const hours = Math.floor(differenceInSeconds / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? "s" : ""} ago`);
      } else {
        const days = Math.floor(differenceInSeconds / 86400);
        setTimeAgo(`${days} day${days > 1 ? "s" : ""} ago`);
      }
    };

    calculateTimeAgo();

    // Update time ago every minute
    const intervalId = setInterval(calculateTimeAgo, 60000);

    return () => clearInterval(intervalId);
  }, [postedAtTime]);

  return <span>{timeAgo}</span>;
};

export default TimeAgo;
