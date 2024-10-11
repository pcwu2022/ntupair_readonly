/** 
 * For notes only, not for execution
 * Request and response protocols are in js object format
**/

// login request: login.js -> loginhandler.js
const loginPost = {
    username: "string",
    password: "encrypted string"
};
// login response: loginhandler.js -> login.js
const loginPostResponse = {
    success: true,
    sessionCode: "string",
    userCount: 100
};
// check session: login.js -> loginhandler.js
const checkSessionPost = {
    username: "string",
    sessionCode: "string"
};
// respond to check session: -> loginhandler.js -> login.js
const sendCheckSessionPost = {
    success: true
};

// submit test form: test.js -> testhandeler.js
const testSubmitPost = {
    username: "string",
    answer: "[stringified array]"
};

// get test question data: test.js -> testhandeler.js
const getQuestionData = {
    title: "string"
};
// send test question data: testhandeler.js -> test.js
const sendQuestionGet = {
    questionArr: "[stringified array]",
    success: true
};

// get test options: home.js -> homehandler.js
const getTests = {
    username: "string"
};
// send test options: homehandler.js -> home.js
const sendTestsGet = {
    tests: `{
        test1: false, //availibility
        test2: true,
        test3: false
    }`,
    success: true
};

// new account post request: account.js -> accounthandler.js
const newAccountPost = {
    username: "string",
    password: "string",
    gender: "string"
};
const sendNewAccountPost = {
    success: true,
    valid: true,
    sessionCode: "string"
};

// match
const getMatch = {
    username: "string",
    useData: ["Test 1", "Test 2"],
    length: 5,
    gender: "Both"
}
// match response
const sendMatchGet = {
    success: true,
    result: `{
        user1: 0.5,
        user2: 0.2
    }`,
    gender: `{
        user1: Male,
        user2: Female
    }`,
    onlineStatus: `{
        user1: true
        user2: 1234
    }`
}

// get profile: profile.js -> profilehandler.js
const getProfile = {
    username: "string"
};
// response to get profile: profilehandler.js -> profile.js
const sendProfileGet = {
    success: true,
    profile: {},
    department: ""
};

// set profile: profile.js -> profilehandler.js (viewProfile)
const setProfileGet = {
    username: "string",
    params: "string"
};
// set profile response: profilehandler.js -> profile.js (viewProfile)
const setProfileSend = {
    success: true
};

// get chat menu: chatmenu.js -> chatmenuhandler.js
const getChatmenu = {
    username: "string"
};
// send response to getChatmenu: chatmenuhandler.js -> chatmenu.js
const sendChatmenuGet = {
    success: true,
    chatArr: `[
        {
            target: "string",
            status: "accepted"
        }
    ]`
};

// get chat status: viewprofile.js -> chatmenuhandler.js
const getChatStatus = {
    username: "string",
    target: "string"
};
// respond to get chat status: viewprofile.js <- chatmenuhandler.js
const sendChatStatusGet = {
    success: true,
    status: "accepted"
};

// update chat status: viewprofile.js, chat.js -> chatmenuhandler.js
const updateChatStatus = {
    username: "string",
    target: "string",
    status: "accepted"
};
// respond to update chat status: chatmenuhandler.js -> viewprofile.js, chat.js
const sendUpdateChatStatusPost= {
    success: true
}

// get notifications
const getNotifications = {
    username: "string"
};
const sendNotificationGet = {
    success: true,
    notifications: "[[message, link(page), time(yyyy/mm/dd)]]"
};

// send profile photo
const uploadProfileFetch = {
    username: "string",
    profileImage: "file"
};
const sendUploadProfileFetch = {
    success: true,
    path: "./files/profile/..."
};

// send mail
const sendMailPost = {
    username: "string",
    address: "example@example.com"
};
const sendSendMailPost = {
    success: true,
    warning: "Maximum mail sent|Cannot send to address"
};

// check verification key
const checkKey = {
    username: "string",
    key: "string"
};
const sendCheckKey = {
    success: true,
    warning: "Key expired",
    department: "EE 1"
};

// send department
const sendDepartment = {
    username: "string",
    department: "string"
};
const sendSendDepartment = {
    success: true
};

// !!!!! add "success" to every request response !!!!!


// socket
// !! consider using session check
const join = {
    username: "username1",
    target: "username2",
    sessionCode: "code"
};
const message = {
    text: "text"
};
const receiveMessage = {
    text: "text",
    target: "text",
    time: 12345678
};
const error = {
    message: "message"
};
const readMessage = {
    read: true
};
const receiveRead = {
    read: true,
    target: "string"
};
const prevMessage = {
    data: [{},{}]
};
const leave = {
    message: "No existing chatroom"
};
const requesting = {
    message: "Requesting"
};
const accept = {
    message: "accept"
};
const reject = {
    message: "reject"
};
const online = {
    username: "string"
};
const offline = {
    username: "string"
};