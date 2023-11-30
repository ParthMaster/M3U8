const moment = require("moment");

function formatTime(inputTime) {
  const timeArray = inputTime.split(":");

  if (timeArray.length === 3) {
    const formattedTime = moment(inputTime, "HH:mm:ss.SSSSSSSSS").format(
      "HH:mm:ss.SS"
    );
    return formattedTime;
  } else if (timeArray.length === 1) {
    const formattedTime = moment
      .utc(parseFloat(inputTime) * 1000)
      .format("HH:mm:ss.SS");
    return formattedTime;
  } else {
    // Invalid format
    return "Invalid time format";
  }
}

const formattedTime1 = formatTime("00:50:22.542000000");
console.log(formattedTime1);

const formattedTime2 = formatTime("15.3");
console.log(formattedTime2);
