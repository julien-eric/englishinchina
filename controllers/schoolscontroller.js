const _ = require('underscore');
const utils = require('../utils');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const School = require('../models/school');
const provincesController = require('./provincescontroller');
const citiesController = require('./citiescontroller');
const companiesController = require('./companiescontroller');
const reviewsController = require('./reviewscontroller');
const imagesController = require('./imagescontroller');
const MISSING = -1;
const SHORT_LIST = [{ $project: { name: 1, province: 1, city: 1 } }];

let SchoolsController = function () { };

let unpluck = function (array) {
    return _.filter(array, function (element) {
        return Object.getOwnPropertyNames(element).length != 0;
    });
};

SchoolsController.prototype.getAllSchools = function () {
    return School.find().exec();
};

SchoolsController.prototype.featuredSchools = function () {
    // At the moment featured schools are schools with the highest ratings
    return School.find()
        .sort({ averageRating: -1 })
        .where({ validated: true })
        .limit(3)
        .exec();
};

SchoolsController.prototype.getSchools = async function (pageSize, page) {

    let schools = await School.find()
        .populate('province')
        .populate('city')
        .populate('company')
        .where({ validated: true })
        .limit(pageSize)
        .skip(pageSize * page)
        .exec();
    schools.count = await School.count().where({ validated: true }).exec();
    return schools;
};

SchoolsController.prototype.addSchool = async function (user, school) {

    let userId = user ? user._id : null;
    let province = await provincesController.getProvinceByCode(school.provinceCode);
    let city = await citiesController.getCityByCode(school.cityCode);
    let company = null;
    if (school.company !== '-1') {
        company = await companiesController.findCompanyById(school.company);
    }
    let createdSchool = await School.create({
        user: userId,
        name: school.name,
        description: school.description,
        website: school.website,
        schoolType: school.schoolType,
        province,
        city,
        company,
        address: school.address,
        phone: school.phone,
        pictureUrl: school.urlNewSchoolPicture,
        averageRating: -1
    });
    let image = await imagesController.addImage({
        type: 1,
        user: userId,
        school: createdSchool,
        description: createdSchool.name,
        url: createdSchool.pictureUrl,
        date: Date.now()
    });
    const xschool = createdSchool.toObject();
    xschool.photos.push(image);
    return School.findOneAndUpdate({ _id: xschool._id }, xschool);
};

SchoolsController.prototype.deleteSchool = function (id) {
    return School.find({ _id: id }).remove();
};

SchoolsController.prototype.editSchool = async function (queryInfo) {

    let province = await provincesController.getProvinceByCode(queryInfo.province);
    let city = await citiesController.getCityByCode(queryInfo.city);
    let company = null;
    if (queryInfo.company !== '-1') {
        company = await companiesController.findCompanyById(queryInfo.company);
    }

    // See if we could just use this.....
    let oldSchool = await module.exports.findSchoolById(queryInfo.id);
    const newSchool = this.fillInNewSchool(queryInfo, oldSchool, { province: province._id, city: city._id, company: company._id });
    let editedSchool = await School.findOneAndUpdate({ _id: queryInfo.id }, newSchool);

    let image = await imagesController.addImage({
        type: 1,
        user: null,
        school: editedSchool,
        description: editedSchool.name,
        url: editedSchool.pictureUrl,
        date: Date.now()
    });
    const xschool = editedSchool.toObject();
    xschool.photos.push(image);
    return School.findOneAndUpdate({ _id: xschool._id }, xschool);
};

SchoolsController.prototype.fillInNewSchool = function (queryInfo, oldSchool, newqueryInfo) {
    let newSchool = newqueryInfo;
    if (oldSchool.name !== queryInfo.name) {
        newSchool.name = queryInfo.name;
    }
    if (oldSchool.description !== queryInfo.description) {
        newSchool.description = queryInfo.description;
    }
    if (oldSchool.address !== queryInfo.address) {
        newSchool.address = queryInfo.address;
    }
    if (oldSchool.phone !== queryInfo.phone) {
        newSchool.phone = queryInfo.phone;
    }
    if (oldSchool.website !== queryInfo.website) {
        newSchool.website = queryInfo.website;
    }
    if (oldSchool.schoolType !== queryInfo.schoolType) {
        newSchool.schoolType = queryInfo.schoolType;
    }
    if (oldSchool.pictureUrl !== queryInfo.avatarUrl) {
        newSchool.pictureUrl = queryInfo.avatarUrl;
        newPicture = true;
    }
    return newSchool;
};

SchoolsController.prototype.updatePictures = function (school) {
    return School.findOneAndUpdate({ _id: school._id }, { photos: school.photos });
};

SchoolsController.prototype.validateSchool = function (id, validate) {
    let valida = true;
    if (typeof (validate) !== 'boolean') {
        // See if mongoose still casts anything to Boolean or not
        return Promise.reject(new Error('Trying to validate school, but value is not Boolean'));
    }
    return School.findOneAndUpdate({ _id: id }, { validated: valida });
};

SchoolsController.prototype.findSchoolByName = function (name) {
    return School.findOne({ name }).exec();
};

SchoolsController.prototype.findSchoolById = async function (id) {

    let pipeline = [
        { $match: { _id: ObjectId(id) } },
        { $lookup: { from: 'provinces', localField: 'province', foreignField: '_id', as: 'province' } },
        { $unwind: '$province' },
        { $lookup: { from: 'cities', localField: 'city', foreignField: '_id', as: 'city' } },
        { $unwind: '$city' },
        { $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' } },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'images', localField: 'photos', foreignField: '_id', as: 'photos' } },
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'foreignId', as: 'reviews' } },
        { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'users', localField: 'reviews.user', foreignField: '_id', as: 'reviews.user' } },
        { $unwind: { path: '$reviews.user', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$_id',
                user: { $first: '$user' },
                name: { $first: '$name' },
                description: { $first: '$description' },
                website: { $first: '$website' },
                address: { $first: '$address' },
                phone: { $first: '$phone' },
                province: { $first: '$province' },
                city: { $first: '$city' },
                company: { $first: '$company' },
                schoolType: { $first: '$schoolType' },
                pictureUrl: { $first: '$pictureUrl' },
                criteria: { $first: '$criteria' },
                averageRating: { $first: '$averageRating' },
                validated: { $first: '$validated' },
                photos: { $first: '$photos' },
                reviews: { $addToSet: '$reviews' }
            }
        }
    ];

    let school = (await School.aggregate(pipeline).exec())[0];
    school.reviews = unpluck(school.reviews);
    return school;
};

SchoolsController.prototype.findSchoolsByProvince = function (province) {
    return School.find({ province }).exec();
};

SchoolsController.prototype.findSchoolsByCompany = function (company) {

    return School.aggregate([
        { $match: { company: company._id } },
        { $lookup: { from: 'provinces', localField: 'province', foreignField: '_id', as: 'province' } },
        { $unwind: '$province' },
        { $lookup: { from: 'cities', localField: 'city', foreignField: '_id', as: 'city' } },
        { $unwind: '$city' },
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'foreignId', as: 'reviews' } }
    ]).exec();
};

SchoolsController.prototype.findSchoolsByCompanySortbyRating = function (company) {
    return School.find({ company })
        .sort({ averageRating: -1 })
        .populate('province')
        .populate('city')
        .populate('company')
        .limit(3)
        .exec();
};

/**
 * @param  {String} queryInfo String to look for in the school's name
 * @param  {String} provinceInfo Look for the school in this province
 * @param  {String} cityInfo Look for the school in this city
 * @param  {Object} sorting  Which attributes to sort the list by (rating or name)
 * @param  {Number} limit The number of records to keep from the list
 * @param  {Boolean} shortRecords Get a few attributes or the complete object (short->autocomplete, complete->school list)
 * @return {Object} An object containing a list of the schools return, the search information and the query
 */
SchoolsController.prototype.searchSchools = async function (queryInfo, provinceInfo, cityInfo, sorting, limit, shortRecords) {

    let searchInfo = {};
    let schoolList = undefined;
    let regex = undefined;
    let total;

    let sort = {};
    if (!sorting) {
        sorting = { attribute: 'averageRating', order: -1 };
    }
    sort[sorting.attribute] = sorting.order;

    searchInfo.school = queryInfo;

    if (searchInfo.school) {
        regex = new RegExp(utils.returnRegex(searchInfo.school));
    } else {
        regex = new RegExp('');
    }

    let transactions = School.aggregate([
        { $match: { name: { $regex: regex, $options: 'i' } } },
        { $sort: sort }
    ]);

    if (provinceInfo != MISSING) {
        if (provinceInfo.id != undefined) {
            province = provinceInfo;
        } else {
            province = await provincesController.getProvinceByCode(provinceInfo);
        }
        searchInfo.province = province.name;
        transactions._pipeline.push({ $match: { province: province._id } });
    }

    if (cityInfo != MISSING) {
        if (cityInfo.id != undefined) {
            city = cityInfo;
        } else {
            city = await citiesController.getCityByCode(cityInfo);
        }
        searchInfo.city = city.pinyinName;
        transactions._pipeline.push({ $match: { city: city._id } });
    }

    transactions._pipeline = transactions._pipeline.concat([
        { $lookup: { from: 'provinces', localField: 'province', foreignField: '_id', as: 'province' } },
        { $unwind: '$province' },
        { $lookup: { from: 'cities', localField: 'city', foreignField: '_id', as: 'city' } },
        { $unwind: '$city' },
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'foreignId', as: 'reviews' } }
    ]);

    if (shortRecords) {
        transactions._pipeline = transactions._pipeline.concat(SHORT_LIST);
    }

    try {
        schoolList = await transactions.exec();
        total = schoolList.length;
        schoolList = _.first(schoolList, limit || 9999);

    } catch (error) {
        console.log(error);
    }
    let searchQuery = this.getQueryMessage(searchInfo);
    // Frontend Typeahead wrapper .limit() has bug (if result.number == limit), so this way we get both .count and limit in one query
    return { list: schoolList, total, query: searchQuery, searchInfo: { province: provinceInfo, city: cityInfo, queryInfo: queryInfo } };
};

SchoolsController.prototype.getQueryMessage = function (queryInfo) {
    let queryMessage = '';
    let exists = function (value) {
        if (value == MISSING || value == undefined || value == '') {
            return false;
        } else { }
        return true;
    };

    // Verify if we have any school info
    if (exists(queryInfo.school)) {
        queryMessage += queryInfo.school;
        if (exists(queryInfo.province) || exists(queryInfo.city)) {
            queryMessage += ' in ';
        }
    }

    // Add information for province and city
    if (exists(queryInfo.province)) {
        queryMessage += queryInfo.province;
        if (exists(queryInfo.city)) {
            queryMessage += ', ' + queryInfo.city;
        }
    } else {
        if (exists(queryInfo.city)) {
            queryMessage += queryInfo.city;
        }
    }

    return queryMessage;
};

SchoolsController.prototype.emptySchoolCollection = function () {
    return School.remove({});
};

SchoolsController.prototype.selectSplashSchool = function (schools) {
    let splashSchool = { averageRating: -1 };
    schools.forEach((school) => {
        if (school.averageRating > splashSchool.averageRating) {
            splashSchool = school;
        }
    });
    if (splashSchool.averageRating == -1) {
        splashSchool = schools[0];
    }
    return splashSchool;
};

SchoolsController.prototype.updateCoverPicture = function (schoolId, newPictureUrl) {
    return School.findOneAndUpdate({ _id: schoolId }, { pictureUrl: newPictureUrl });
};

SchoolsController.prototype.updateAverageRating = async function (schoolId) {
    let reviews = await reviewsController.findReviews(schoolId);

    let averageScore = 0;
    const criteria = {
        c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, c8: 0
    };
    for (const review in reviews) {
        averageScore += reviews[review].average_rating;
        criteria.c1 += reviews[review].criteria.c1;
        criteria.c2 += reviews[review].criteria.c2;
        criteria.c3 += reviews[review].criteria.c3;
        criteria.c4 += reviews[review].criteria.c4;
        criteria.c5 += reviews[review].criteria.c5;
        criteria.c6 += reviews[review].criteria.c6;
        criteria.c7 += reviews[review].criteria.c7;
        criteria.c8 += reviews[review].criteria.c8;
    }
    averageScore /= reviews.length;
    criteria.c1 /= reviews.length;
    criteria.c2 /= reviews.length;
    criteria.c3 /= reviews.length;
    criteria.c4 /= reviews.length;
    criteria.c5 /= reviews.length;
    criteria.c6 /= reviews.length;
    criteria.c7 /= reviews.length;
    criteria.c8 /= reviews.length;

    return School.findOneAndUpdate({ _id: schoolId }, { averageRating: averageScore, criteria });
};

let schoolsController = new SchoolsController();
module.exports = schoolsController;
