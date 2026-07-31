const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subtitle: {
        type: String,
        required: [true, 'Please add a subtitle'],
        trim: true,
        maxlength: [200, 'Subtitle cannot be more than 200 characters']
    },
    image1: {
        type: String,
        default: 'no-photo.jpg'
    },
    image2: {
        type: String,
        default: 'no-photo.jpg'
    },
 
    skillSlug: {
        type: String,
        trim: true,
        default: 'all'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
