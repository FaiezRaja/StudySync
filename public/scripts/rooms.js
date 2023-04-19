//Allows for switching between tabs in video and chat container
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
    }
    document.getElementById("chat-tab-content-" + tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function openVideoTab(evt, tabName) {
    var i, tabcontent2, tablinks;
    tabcontent2 = document.getElementsByClassName("video-tab-content");
    for (i = 0; i < tabcontent2.length; i++) {
    tabcontent2[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("video-tab-button");
    for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
    }
    document.getElementById("video-tab-content-" + tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function copyClipboard() {
    var copyRoomLink = window.location.href;
    navigator.clipboard.writeText(copyRoomLink);
    alert("Room link copied to clipboard: " + copyRoomLink);
}