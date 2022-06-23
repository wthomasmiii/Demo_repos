const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const SI = require("../models/simulatorInformation");
const multer = require('multer');

const defaultJson = require("../utils/SimulatorInformationDefault.json");

// @desc      Get all users
// @route     GET /api/v1/simulatorInformation/
// @access    Private/Admin
exports.getMySimulatorInformation = asyncHandler(async (req, res, next) => 
{  
    const simulatorInformation = await SI.findOne({userId: req.user._id}).populate("userId");

    if(simulatorInformation == null){
        let newSimulatorInformation = defaultJson;

        newSimulatorInformation.userId = req.user._id;

        await SI.create(newSimulatorInformation);

        res.status(200).json({
            success: true,
            data: newSimulatorInformation
        });
    } 
    else
    {
        res.status(200).json({
            success: true,
            data: simulatorInformation
        })
    };

});


// @desc      Get all users
// @route     GET /api/v1/simulatorInformation/:userId/:SIID
// @access    Private/Admin
exports.getUserSimulationInformation = asyncHandler(async (req, res, next) => 
{  
    const simulatorInformation = await SI.findOne({userId: req.params.userId, _id:req.params.SIID}).populate("userId");

        res.status(200).json({
            success: true,
            data: simulatorInformation
        });

});

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


exports.patchTrailerObject = asyncHandler(async (req,res,next) => {

 await upload(req, res, (err) => {
    if(err){
      // res.render('index', {
      //   msg: err
      // });
    } else {
      if(req.file == undefined){
        // res.render('index', {
        //   msg: 'Error: No File Selected!'
        // });
      } else {
        // res.render('index', {
        //   msg: 'File Uploaded!',
        //   file: `uploads/${req.file.filename}`
        // });
      }
    }
    
  });

  // await SI.findOne({userId: req.user._id}, async function(err, foundDoc) {

  //   if(SI == null)
  //   {
  //     res.status(403).json({"msg":"user Not Found"});
  //   }

  //   if(!req.body.images.length < 1 )
  //   {
  //     res.status(400).json({"msg": "No images included!"});
  //   }

  //   SI.images.forEach(element => {
  //     req.body.images.forEach(bodyElement => {
  //       if(element.type == bodyElement.type){
  //         element.linkToImages = body.linkToImage;
  //       }
  //     });
  //   });
  //   console.log(SI.images);

  //   const newDoc = await foundDoc.save(function(err) {
  //     if (err)
  //       console.log(err)
  //     else
  //       console.log('success')
  //   });

  //   if (!foundDoc | !req.body.images | !req.body.name)
  //     return next(new Error('Could not load Document'));
  //   else 
  //     console.log("here");
  // });
  res.status(200).json({
    success: true,
    data: "jsdf",
});
})


// @desc      Get single user
// @route     PATCH /api/v1/simulatorInformation/:Type
// @access    Private/Admin
exports.patchTruckObject = asyncHandler(async (req, res, next) => {
    let tempDoc;
    await SI.findOne({userId: req.user._id}, async function(err, foundDoc) {
        if (!foundDoc | !req.body.hexColor | !req.body.name)
          return next(new Error('Could not load Document'));
        else {
          // do your updates here
          let type = parseInt(req.params.Type);
          console.log(type);
          console.log(req.body.name);
          switch(type){
              case 1:
                foundDoc.truck1Object.name = req.body.name;
                foundDoc.truck1Object.hexColor = req.body.hexColor;
                foundDoc.truck1Object.type = foundDoc.truck1Object.type;
                break;
              case 2:
                foundDoc.truck2Object.name = req.body.name;
                foundDoc.truck2Object.hexColor = req.body.hexColor;
                foundDoc.truck2Object.type = foundDoc.truck2Object.type;
                      break;
              case 3:
                foundDoc.truck3Object.name = req.body.name;
                foundDoc.truck3Object.hexColor = req.body.hexColor;
                foundDoc.truck3Object.type = foundDoc.truck3Object.type;
                break;
          }
          console.log(foundDoc);

         const newDoc = await foundDoc.save(function(err) {
            if (err)
              console.log(err)
            else
              console.log('success')
          });
          tempDoc = foundDoc;
        }
      });
      
    res.status(200).json({
        success: true,
        data: tempDoc,
    });
});

exports.patchImages = asyncHandler(async (req, res, next) => {

    await SI.findOne({userId: req.user._id}, async function(err, foundDoc) {

        
    });

});
