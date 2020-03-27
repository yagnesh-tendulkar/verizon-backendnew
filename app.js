var rp = require('request-promise');
const WebSocket = require("ws");
const express = require("express");

const logger = require('./insights-logger');

const app = express();
var cors = require('cors')
const bodyParser = require('body-parser')
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });
var request = require("request");
var mongoose = require("mongoose")
var path = require('path')
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Credentials", false);
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var feedback = false
var i = 0;

const client = require('twilio')(accountSid, authToken);

const MessagingResponse = require('twilio').twiml.MessagingResponse;
ref = '66de3faf4563ceb1dec07cb2eede76ca';
sec_token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTc4ZGE2YmE2MzNhNTJmNGNmYjhkMzIiLCJjcmVhdGVkQXQiOiIyMDIwLTAzLTIzVDE1OjQ4OjU5Ljg4MVoiLCJpYXQiOjE1ODQ5Nzg1Mzl9.sIGJFUjA_JP3GYuSU8QS06a-F37yU8HhQC5SCGWQokw';
agent=false
//https://minsights-dialogflow-api.azurewebsites.net/conversation/messages/:owner_id
var requestPayload = {
    url: "https://minsights-dialogflow-api.azurewebsites.net/conversation/messages/5e78da6ba633a52f4cfb8d32",
    method: 'GET',
    json: true,
    headers: {
        'refid': ref
    },
    auth: {
        'bearer': sec_token
    }
};
mongoose.connect('mongodb+srv://yagnes:mlab@cluster0-s1fce.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, function (err, resp) {
    if (err)
        console.log(err)
    else
        console.log("connected")
});

data = {
    "_id": String,
    "Name": String,
    "address": String,
    "date": String,
    "msgs": [],
    "agent": Boolean
}

var index;
// io.set('origins', '*:*');
// io.origins('*:*')
var userdata = []
var details = mongoose.model('twiliodata', data);
var to = "+918464041124";
// var to = "+12404282838";
details.find({}, (err, res) => {
    console.log(res)
    userdata = res
})
console.log(userdata)
index = userdata.findIndex(obj => obj._id == to);
console.log("index**************", index)
let res1, req1;
var agent = false;
app.post('/webhook', async function (req, res) {
    req1 = req
    res1 = res
    // console.log(req.body.originalDetectIntentRequest.payload.data.From)
    // to = req.body.originalDetectIntentRequest.payload.data.From

    details.find({}, (err, res) => {
        console.log(res)
        userdata = res
        index = userdata.findIndex(obj => obj._id == to);
        console.log("index**************", index)

    })
    if (index == -1) {
        userdata.push({
            _id: to,
            msgs: [],
            Name: to,
            address: "",
            date: "",
            agent: false
        })
    }

    console.log(req.body.queryResult)
    index = await userdata.findIndex(obj => obj._id == to);
    console.log("index**************", index)
    a = await userdata[index].msgs.push({ "from": "recv", "text": req.body.queryResult.queryText, "time": Date.now() })
    console.log("index**************", userdata)
    res = new logger.DialogflowFulfillmentLogger(req, res);
    if (agent) {
        socketFunction("message", req.body.queryResult.queryText)
    }
    else {
        if (req.body.queryResult.intent.displayName == "capability") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "I can help answer your questions, schedule appointments with technicians and much more!.",
                    "source": 'twilio'
                });
                sendMessage("I can help answer your questions, scheduling appointments with technicians and much more!.", to)

            }
        }
        if (req.body.queryResult.intent.displayName == "Greeting") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "Hello, I am Kiara - the intelligent response bot for Miracle Telecom.",
                    "source": 'twilio'
                });
                sendMessage("Hello, I am Kiara - the intelligent response bot for Miracle Telecom.", to)

            }
        }
        if (req.body.queryResult.intent.displayName == "Thanks") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "Thank you, have a nice day.",
                    "source": 'twilio'
                });
                sendMessage("Thank you, have a nice day.", to)

            }
        }

        if (req.body.queryResult.intent.displayName == "survey-yes") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "How was your experience with our technician today? Rate between 1 and 5.",
                    "source": 'twilio'
                });
                sendMessage("Thank you, Have a nice day.", to)

            }
        }


        if (req.body.queryResult.intent.displayName == "survey-no") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "We can understand, thank you and have a great day!.",
                    "source": 'twilio'
                });
                // sendMessage("Thank you, Have a nice day.", to)

            }
        }

        if (req.body.queryResult.action == "survey-yes.survey-yes-custom") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "How would you rate the quality of service? Rate between 1 and 5.",
                    "source": 'twilio'
                });
                sendMessage("Thank you, Have a nice day.", to)

            }
        }

        if (req.body.queryResult.intent.displayName == "availabilNo - yes - custom") {

            if (req.body.queryResult.queryText == "1") {
                res.json({
                    "fulfillmentText": " Thank you. Your appointment is rescheduled successfully to 10 AM.",
                    "source": 'twilio'
                });
            }
            if (req.body.queryResult.queryText == "2") {
                res.json({
                    "fulfillmentText": " Thank you. Your appointment is rescheduled successfully to 2 PM.",
                    "source": 'twilio'
                });
            }
            if (req.body.queryResult.queryText == "3") {
                res.json({
                    "fulfillmentText": " Thank you. Your appointment is rescheduled successfully to 4 PM.",
                    "source": 'twilio'
                });
            }

        }
        if (req.body.queryResult.action == "survey-yes.survey-yes-custom.survey-yes-custom-custom") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "How punctual was our technician for today’s appointment? Rate between 1 and 5 ",
                    "source": 'twilio'
                });
                sendMessage("Thank you, Have a nice day.", to)

            }
        }

        if (req.body.queryResult.action == "survey-yes.survey-yes-custom.survey-yes-custom-custom.survey-yes-custom-custom-custom") {
            if (index != -1) {
                res.json({
                    "fulfillmentText": "Thank you for your time and feedback, we hope to serve you again soon. Have a great day!",
                    "source": 'twilio'
                });
                sendMessage("Thank you, Have a nice day.", to)

            }
        }

        

        if (req.body.queryResult.intent.displayName == "availabilNo - no") {
            res.json({
                "fulfillmentText": "Your appointment has been cancelled. You can schedule a new appointment at any time.",
                "source": 'twilio'
            });
            sendMessage("You have 50% off on prepaid recharge.", to)
        }
        //
        if (req.body.queryResult.intent.displayName == "agent") {
            if (index != -1) {
                // userdata[index].agent = true
                chat("Please wait a moment while we connect you with an available agent.", to)
                socketFunction("request", userdata[index])
            }
        }
        // console.log(req.body.originalDetectIntentRequest.payload.data.From)
        // var date = new Date(req.body.queryResult.parameters.time);
        console.log(req.body.queryResult.intent.displayName)
        console.log(req.body.queryResult)
        // sendMessage("hi",to)
        if (req.body.queryResult.intent.displayName == "offers") {
            res.json({
                "fulfillmentText": "You have 50% off on prepaid recharge.",
                "source": 'twilio'
            });
            sendMessage("You have 50% off on prepaid recharge.", to)
        }

        if (req.body.queryResult.intent.displayName == "ScheduleAppointment - custom") {
            res.json({
                "fulfillmentText": "Thank you, your appointment has been scheduled successfully.",
                "source": 'twilio'
            });

        }

        if (req.body.queryResult.intent.displayName == "ScheduleAppointment") {

            if (req.body.queryResult.parameters.name == "" || req.body.queryResult.parameters.code == "") {
                res.json({
                    "fulfillmentText": req.body.queryResult.fulfillmentText,
                    "source": 'twilio'
                });
                sendMessage(req.body.queryResult.fulfillmentText, to)
            }
            else {
                // date = req.body.queryResult.parameters.date.split('T')[0]
                // data = {
                //     "_id": "String",
                //     "Name": req.body.queryResult.parameters.name,
                //     "address": req.body.queryResult.parameters.address,
                //     "date": req.body.queryResult.parameters.date+''
                // }
                // details.insertMany(data, (err, res1) => {
                //     console.log(err, res1)
                // })

                // console.log(req.body.queryResult.parameters.name, req.body.originalDetectIntentRequest)
                // console.log(req.body.queryResult.parameters.address, req.body.queryResult.parameters)
                // date = req.body.queryResult.parameters.date.split('T')[0]
                // var date = new Date(date).getTime()
                // console.log(date)
                res.json({
                    "fulfillmentText": "I have a technician available for "+req.body.queryResult.queryText+" on the following dates. Select which number will work for you.\n---------------\n#1 - April 1st - 12 PM EST\n#2 - April 2nd - 1 PM EST\n---------------",
                    "source": 'twilio'
                });
                sendMessage("Thank you. Your appointment is scheduled successfully.", to)
            }

        }
        if (req.body.queryResult.intent.displayName === "availability-yes") {

            console.log(req.body.queryResult.intent.displayName, "*******************************")
            var date = new Date(req.body.queryResult.parameters.time);
            var time = date.toLocaleString().split(',')[1]
            console.log(time)
            sendMessage("Thank you, our technician will be there for the appointment!", to)
            res.json({
                "fulfillmentText": "Thank you, our technician will be there for the appointment!",
                "source": 'twilio'
            });

        }


        if (req.body.queryResult.intent.displayName === "availabilNo") {

            console.log(req.body.queryResult.intent.displayName, "*******************************")
            var date = new Date(req.body.queryResult.parameters.time);
            var time = date.toLocaleString().split(',')[1]
            console.log(time)
            sendMessage("Do you want me to reschedule the appointment?", to)
            res.json({
                "fulfillmentText": "Do you want me to reschedule the appointment?",
                "source": 'twilio'
            });

        }
        if (req.body.queryResult.intent.displayName === "availabilNo - yes") {

            console.log(req.body.queryResult.intent.displayName, "*******************************", req.body.queryResult.parameters.date)
            if (req.body.queryResult.parameters.date == '') {
                res.json({
                    "fulfillmentText": req.body.queryResult.fulfillmentText,
                    "source": 'twilio'
                });

            }
            else {
                var date = new Date(req.body.queryResult.parameters.time);
                var time = date.toLocaleString().split(',')[1]
                console.log(time)
                sendMessage("Do you want me to reschedule the appointment?", to)
                res.json({
                    "fulfillmentText": "Please select an available appointment time for " + req.body.queryResult.queryText + ".\n-----------------------\n#1 - 10 AM \n#2 - 2 PM   \n#3 - 4 PM\n---------------------",
                    "source": 'twilio'
                });
            }

        }



    }

});


// sendMessage("Test message to Shrikar", to)
function sendMessage(msg, to) {
    console.log(userdata, index)
    // userdata[index].msgs.push({ "from": "sent", "text": msg, "time": Date.now() })
    // client.messages
    //     .create({
    //         body: msg,
    //         from: '+12404282838',
    //         to: to
    //         // to: '+14697401920'
    //     })
    //     .then(message => console.log(message.sid));
    // return
}
// chat("checking \n working",to)
function chat(msg, to) {
    console.log(userdata, index)
    // userdata[index].msgs.push({ "from": "sent", "text": msg, "time": Date.now() })
    client.messages
        .create({
            body: msg,
            from: '+12404282838',
            to: to
            // to: '+14697401920'
        })
        .then(message => console.log(message.sid));
    return
}


function socketFunction(event, data) {
    console.log("********************************************inside socket function")
    var options = {
        method: 'POST',
        uri: 'https://9f3c6340.ngrok.io/sock',
        body: {
            "event": event,
            "data": data
        },
        json: true // Automatically stringifies the body to JSON
    };

    rp(options)
        .then(function (parsedBody) {
            console.log("parsedBody", parsedBody);
        })
        .catch(function (err) {
            console.log("error", err);
        });
}

console.log("Listening at Port 8080");
server.listen(process.env.PORT || 5000);
app.post('/getMessage', (req, resp) => {

    res = new logger.DialogflowFulfillmentLogger(req1, res1);
    console.log(req.body.message)
    chat(req.body.message, to)
    res1.json({
        "fulfillmentText": req.body.message,
        "source": 'twilio'
    });
    // res.send(true)
})
app.post('/accept', (req, res) => {
    userdata[index].agent = true
    agent=true
    req.body.name
    chat("You have been successfully connected with our agent.", to)
    res.send(true)
})
app.post('/end', (req, res) => {
    chat("You have been disconnected from the agent.", to)
    userdata[index].agent = false
    agent=false
    console.log(userdata, "endeddddddddddddddddddddd")
    res.send(true)
})

app.get('/', (req, res) => {
    res.send("i am working!!")
})

app.post('/feedback', (req, res) => {

    feedback = true
    console.log(req.body.message)
    chat("Would you like to take a quick 3-question survey regarding your appointment today? (Yes/No).", req.body.number)
    res.send(true)
})

app.post('/remainder', (req, res) => {

    feedback = true
    console.log(req.body.message)
    chat("You have scheduled an appointment today at 9AM EST. Please confirm your availability? (Say Yes or No).", req.body.number)
    res.send(true)
})

app.post('/alert', (req, res) => {

    req.body.number
    chat("You have 60% off on new internet connection.", req.body.number)
    res.send(true)
})

app.get('/getdata',(req,res)=>{
    request.get(requestPayload, function (err, response, body) {
        if (!err) {
            console.log(body[0].messages)
            res.send(body[0].messages);
        } else {
            reject(err);
        }
    });
    
})

    // request.get(requestPayload, function (err, response, body) {
    //     if (!err) {
    //         console.log(body[0].messages)
           
    //     } else {
    //         reject(err);
    //     }
    // });
