let URL = "";
let eventTitle = document.getElementById("eventTitle");
const pageID = "pageID";
const checkPageID = Number(localStorage.getItem(pageID));
if (checkPageID == 0) {
    URL = "https://teachablemachine.withgoogle.com/models/dhkbuYQm3/";
    eventTitle.innerHTML = "push Up";
} else if (checkPageID == 1) {
    URL = "";
    eventTitle.innerHTML = "squat";
}