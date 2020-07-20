const express = require('express')
const router = express.Router()
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const {Video} = require('../models/Video')
const { Subscriber } = require('../models/Subscriber')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only mp4 is allowed'), false)
        }
        cb(null, true)
    }
})

const upload = multer({ storage }).single("file")




router.post("/uploadfiles", (req, res) => {

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

})



router.post("/thumbnail", (req, res) => {

    let thumbsFilePath = ""
    let fileDuration = ""


    //thumbnail filepath and duration
    ffmpeg.ffprobe(req.body.filePath, (err, metadata) => {
        // console.dir(metadata)
        // console.log(metadata.format.duration)
        fileDuration = metadata.format.duration
    })

    ffmpeg(req.body.filePath)
        .on('filenames', function (filenames) {
            //if everything goes well
            console.log('Will generate' + filenames.join(','))
            thumbsFilePath = "uploads/thumbnails/" + filenames[0]
        })
        .on('end', function() {
            console.log('Screenshots taken')
            //send message to client in json fmt.
            return res.json({success: true, thumbsFilePath, fileDuration})
        })
        .screenshots({
            //will take screens at 20%, 40%, 60% and 80% of the video
            //sC 3times = 3 thumbnails
            //folder is where the thumbnail will be saved
            count: 3,
            folder: 'uploads/thumbnails',
            size: '320x240',
            filename: 'thumbnail-%b.png'
        })
})



router.post("/uploadVideo", (req, res) => {

    const video = new Video(req.body)

    video.save((err, video) => {
        if(err) return res.status(400).json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
});


router.get("/getVideos", (req, res) => {

    Video.find()
        .populate("writer")
        .exec((err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
    
        })
});

router.post("/getVideo", (req, res) => {

    Video.findOne({ "_id" : req.body.videoId })
        .populate("writer")
        .exec((err, video) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, video })
    
        })
});

//subscribed videos
router.post("/getSubscriptionVideos", (req, res) => {
    //Need 

    Subscriber.find({ 'userFrom': req.body.userFrom })
    .exec((err, subscribers) => {
        if(err) return res.status(400).send(err)

        let subscribedUser = []

        subscribers.map((subscriber, i) => {
            subscribedUser.push(subscriber.userTo)
        })


        //Need to fetch all of the Videos that belong to the Users that l found in previous step.
        //$in-> takes care of every person in the subscribeduser compared.. to the normal method that is limited to one.. check mongodb documentation
        Video.find({ writer: {$in: subscribedUser }})
            .populate('writer')
            .exec((err, videos) => {
                if(err) return res.status(400).send(err)
                res.status(200).json({ success: true, videos })
            })
    })
})



module.exports = router