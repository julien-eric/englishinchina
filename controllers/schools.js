const School = require('./../models/school');
const provincesController = require('./provinces');
const citiesController = require('./cities');
const companiesController = require('./companies');
const imagesController = require('./images');
const jadeutilityfunctions = require('./../routes/jadeutilityfunctions');
const MISSING = -1;
const CASE = {
  CITYPROVINCE: 0,
  CITYNOPROVINCE: 1,
  NOCITYPROVINCE: 2,
  NOCITYNOPROVINCE: 3
};

const fillInNewSchool = function(schoolInfo, oldSchool, newSchoolInfo) {
  let newSchool = newSchoolInfo;
  if (oldSchool.name !== schoolInfo.name) {
    newSchool.name = schoolInfo.name;
  }
  if (oldSchool.description !== schoolInfo.description) {
    newSchool.description = schoolInfo.description;
  }
  if (oldSchool.address !== schoolInfo.address) {
    newSchool.address = schoolInfo.address;
  }
  if (oldSchool.phone !== schoolInfo.phone) {
    newSchool.phone = schoolInfo.phone;
  }
  if (oldSchool.website !== schoolInfo.website) {
    newSchool.website = schoolInfo.website;
  }
  if (oldSchool.schoolType !== schoolInfo.schoolType) {
    newSchool.schoolType = schoolInfo.schoolType;
  }
  if (oldSchool.pictureUrl !== schoolInfo.avatarUrl) {
    newSchool.pictureUrl = schoolInfo.avatarUrl;
    newPicture = true;
  }
  return newSchool;
};

const searchDefinitionCase = function(city, province) {
  if (prov != MISSING) { // Province is specified
    if (city != MISSING) { // City is also specified
      return CASE.CITYPROVINCE;
    } else {
      return CASE.NOCITYPROVINCE;
    }
  } else if (city != MISSING) {
    return CASE.CITYNOPROVINCE;
  } else {
    return CASE.NOCITYNOPROVINCE;
  }
};

module.exports = {

  getAllSchools() {
    return School.find().exec();
  },

  featuredSchools() {
    // At the moment featured schools are schools with the highest ratings
    return School.find()
      .sort({averageRating: -1})
      .where({validated: true})
      .limit(3)
      .exec();
  },

  getSchools(pageSize, page) {
    return getSchools(pageSize, page, null);
  },

  async getSchools(pageSize, page, admin) {
    let adminInfo = {validated: true};
    if (admin == true) {
      adminInfo = {};
    }
    let schools = await School.find()
      .populate('province')
      .populate('city')
      .populate('company')
      .where(adminInfo)
      .limit(pageSize)
      .skip(pageSize * page)
      .exec();
    schools.count = await School.count().where({validated: true}).exec();
    return schools;
  },

  async addSchool(user, school) {

    let province = await provincesController.getProvinceByCode(school.province);
    let city = await citiesController.getCityByCode(school.city);
    let company = null;
    if (school.company !== '-1') {
      company = await companiesController.findCompanyById(school.company);
    }
    let createdSchool = await School.create({
      user: user._id,
      name: school.name,
      description: school.description,
      website: school.website,
      schoolType: school.schoolType,
      province,
      city,
      company,
      address: school.address,
      phone: school.phone,
      pictureUrl: school.avatarUrl,
      averageRating: -1
    });
    let image = await imagesController.addImage({
      type: 1,
      user: null,
      school: createdSchool,
      description: createdSchool.name,
      url: createdSchool.pictureUrl,
      date: Date.now()
    });
    const xschool = createdSchool.toObject();
    xschool.photos.push(image);
    return School.findOneAndUpdate({_id: xschool._id}, xschool);
  },

  deleteSchool(id) {
    return School.find({_id: id}).remove();
  },

  async editSchool(schoolInfo, callback) {

    let province = await provincesController.getProvinceByCode(schoolInfo.province);
    let city = await citiesController.getCityByCode(schoolInfo.city);
    let company = null;
    if (schoolInfo.company !== '-1') {
      company = await companiesController.findCompanyById(schoolInfo.company);
    }

    // See if we could just use this.....
    let oldSchool = await module.exports.findSchoolById(schoolInfo.id);
    const newSchool = fillInNewSchool(schoolInfo, oldSchool, {province: province._id, city: city._id, company: company._id});
    let editedSchool = await School.findOneAndUpdate({_id: schoolInfo.id}, newSchool);

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
    return School.findOneAndUpdate({_id: xschool._id}, xschool);
  },

  updatePictures(school) {
    return School.findOneAndUpdate({_id: school._id}, {photos: school.photos});
  },

  validateSchool(id, validate) {
    let valida = true;
    if (typeof (validate) !== 'boolean') {
      // See if mongoose still casts anything to Boolean or not
      return Promise.reject(new Error('Trying to validate school, but value is not Boolean'));
    }
    return School.findOneAndUpdate({_id: id}, {validated: valida});
  },

  findSchoolByName(name) {
    return School.findOne({name}).exec();
  },

  findSchoolById(id) {
    return School.findOne({_id: id})
      .populate('province')
      .populate('city')
      .populate('photos')
      .populate('company')
      .exec();
  },

  findSchoolsByProvince(province) {
    return School.find({province}).exec();
  },

  findSchoolsByCompany(company) {
    return School.find({company})
      .populate('province')
      .populate('city')
      .exec();
  },

  findSchoolsByCompanySortbyRating(company) {
    return School.find({company})
      .sort({averageRating: -1})
      .populate('province')
      .populate('city')
      .limit('3')
      .exec();
  },

  async searchSchools(schoolInfo, provinceInfo, cityInfo, callback) {

    let query = School
      .find({name: new RegExp(schoolInfo, 'i')})
      .populate('province')
      .populate('city')
      .limit(10);

    if (provinceInfo != MISSING) {
      province = await provincesController.getProvinceByCode(provinceInfo);
      query.where('province').equals(province);
    }

    if (cityInfo != MISSING) {
      city = await citiesController.getCityByCode(cityInfo);
      query.where('city').equals(city);
    }

    return query.exec();
  },

  emptySchoolCollection() {
    return School.remove({});
  },

  updateCoverPicture(schoolId, newPictureUrl) {
    return School.findOneAndUpdate({_id: schoolId}, {pictureUrl: newPictureUrl});
  },

  async updateAverageRating(schoolId) {
    let reviews = await reviews.findReviews(schoolId);

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

    return School.findOneAndUpdate({_id: schoolId}, {averageRating: averageScore, criteria});
  }
};
