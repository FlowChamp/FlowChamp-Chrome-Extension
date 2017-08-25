var url = window.location.href;
var extensionData = [];

if (~url.indexOf("polyplanner.calpoly.edu") && $(".plan.tree.destination").length > 0) {
    getExtensionData();
    $(document).on('click', ".close-popup-message", function() {
        closePopupMessage();
        addCoursesToQuarter()
    });
    $(document).on('click', ".clear-saved-data", function() {
        closePopupMessage();
        clearSavedData();
    });
    $(document).on('click', ".disabled", function() {
        closePopupMessage();
    });
} else {
    $(document).on('click', ".close-popup-message", function() {
        closePopupMessage();
    });
    $(".edit-action-container").prepend(`<div id="send-to-pp-button"><em>PolyPlanner</em></div>`);
    $("#pp-connector-link").hide();
}

$("#send-to-pp-button").click(function() {
    sendDataToPolyPlanner();
});

function sendDataToPolyPlanner() {
    var data = [];
    $(".selected-block .block").each(function() {
        var blockInfo = $(this).children(".block-catalog").children(".block-catalog-info").text().split(" ");
        var quarter = $(this).parent().parent().attr("name");
        var capsule = {department: blockInfo[0], courseNumber: blockInfo[1], quarter: quarter};
        data.push(capsule);
    });
    chrome.runtime.sendMessage(data);
    popupMessage("Sent To PolyPlanner", "The selected courses have been sent to PolyPlanner. Next time you visit PolyPlanner, you'll be prompted to add the courses."); 
}

function closePopupMessage() {
    $(".pp-popup-message, .popup-message").animate({
        opacity: 0,
        top: "-=150",
      }, 100, function() {
        $(this).remove();
      });
    $(".disabled").fadeOut("fast");
}

function getExtensionData() {
    var data = chrome.storage.sync.get("polyPlannerCourses", function(items) {
        if (Object.keys(items).length) {
            var capsules = items.polyPlannerCourses;
            capsules.forEach(function(capsule) {
                extensionData.push(capsule);
            });
            popupPolyPlannerMessage("Message From FlowChamp", "You have courses that are ready to be added to your PolyPlan.", capsules); 
        }
    });
}

function popupPolyPlannerMessage(title, message, capsules, postNote=false) {
    var courseList = ``;
    capsules.forEach(function(capsule) {
        console.log("HERE", capsule);
        courseList = courseList.concat(`<li class="course-list-item">${capsule.department} ${capsule.courseNumber} (${capsule.quarter})</li>`);
    });
    var element = 
        `<div class="disabled"></div>
        <div class="pp-popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <h3 class="popup-body">`+message+`</h3>
            <div class="popup-course-list">${courseList}</div>
            <h4 class="popup-ps">${postNote ? postNote : ""}</h4>
            <h4 class="close-popup-message">Add Courses</h4>
            <h4 class="clear-saved-data">Cancel</h4>
         </div>`;
    $("body").append(element);   
}

function popupMessage(title, message, postNote=false) {
    var element = 
        `<div class="disabled"></div>
        <div class="popup-message ext-popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <h3 class="popup-body">`+message+`</h3>
            <h4 class="popup-ps">${postNote ? postNote : ""}</h4>
            <a class="visit-pp-button" id="visit-polyplanner" href="http://polyplanner.calpoly.edu" target="_blank"><h4>Visit</h4></a>
            <h4 class="close-popup-message">Close</h4>
         </div>`;
    $("body").append(element);   
}

function clearSavedData() {
    chrome.storage.sync.remove("polyPlannerCourses");
}

function addCoursesToQuarter() {
    extensionData.forEach(function(capsule) {
        console.log(capsule);
        var dest = $(`.plan.tree.destination li span:contains(${capsule.quarter})`);
        var addBtn = dest.parent().children("ul").children(".term-show").children(".btn").eq(0);
        addBtn[0].click();
        document.getElementById("manualAddCourseToTerm_name").value = capsule.department;
        document.getElementById("manualAddCourseToTerm_num").value = capsule.courseNumber;
        document.getElementById("yui-gen0-button").click();
    });
    
    chrome.storage.sync.remove("polyPlannerCourses");
}