const mongoose = require('mongoose');
const { getDateString, getRelativeDateString } = require('../utils/dateHelper');

const TrailerImageSubSchema = new mongoose.Schema({
    type: {
        type: Number,
        enum: [0,1,2,3,4,5],
        required: true
    },
    linkToImage: {
        type: String,
        required: true
    }
});

const TruckObjectSubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        enum: [1,2,3],
        required: true
    },
    hexColor: {
        type: String,
        required: true
    }
})

const SimulatorInformationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	images: [TrailerImageSubSchema],
    truck1Object: {
        type: TruckObjectSubSchema
    },
    truck2Object:{
        type: TruckObjectSubSchema
    },
    truck3Object: {
        type: TruckObjectSubSchema
    }
});


const SimulatorInformation = mongoose.model('SimulatorInformation', SimulatorInformationSchema);

module.exports = SimulatorInformation;
