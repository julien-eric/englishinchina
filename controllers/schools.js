const School = require('./../models/school');
const provincesController = require('./provinces');
const reviews = require('./reviews');
const citiesController = require('./cities');
const companiesController = require('./companies');
const imagesController = require('./images');
const jadeutilityfunctions = require('./../routes/jadeutilityfunctions');
const async = require('async');

module.exports = {

  getAllSchools(callback) {
    School.find().exec((err, schoolList) => {
      if (err) {
 console.log(err);
} else {
 callback(schoolList);
}
    });
  },

  featuredSchools(callback) {
    // At the moment featured schools are schools with the highest ratings
    School.find()
      .sort({averageRating: -1})
      .where({validated: true})
      .limit(3)
      .exec((err, schoolList) => {
 callback(err, schoolList);
});
  },

  getSchools(callback, pageSize, page) {
    getSchools(callback, pageSize, page, null);
  },

  getSchools(callback, pageSize, page, admin) {
    let adminInfo = {validated: true};
    if (admin == true) {
      adminInfo = {};
    }
    School.count()
      .where({validated: true})
      .exec((err, count) => {
        School.find()
          .populate('province')
          .populate('city')
          .populate('company')
          .where(adminInfo)
          .limit(pageSize)
          .skip(pageSize * page)
          .exec((err, schools) => {
            callback(count, schools);
          });
      });
  },

  addSchool(user, school, callback) {
    async.waterfall(
      [

        function getProvince(next) {
          provincesController.getProvinceByCode(school.province, (err, province) => {
            if (!err) {
              next(null, province);
            }
          });
        },
        function getCity(province, next) {
          citiesController.getCityByCode(school.city, (city) => {
            next(null, province, city);
          });
        },
        function getCompany(province, city, next) {
          if (school.company == '-1') {
            next(null, province, city, null);
          } else {
            companiesController.findCompanyById(school.company, (company) => {
              next(null, province, city, company);
            });
          }
        },
        function createSchool(province, city, company, next) {
          School.create({
            user: user._id,
            name: school.name,
            description: school.description,
            website: school.website,
            schoolType: school.schoolType,
            province, city,
            company,
            address: school.address,
            phone: school.phone,
            pictureUrl: school.avatarUrl,
            averageRating: -1
          }, (err, newSchool) => {
            next(err, province, city, newSchool);
          });
        },
        function createPicture(province, city, createdSchool, next) {
          imagesController.addImage(
            {
              type: 1,
              user: null,
              school: createdSchool,
              description: createdSchool.name,
              url: createdSchool.pictureUrl,
              date: Date.now()
            },
            (err, image) => {
              if (!err) {
                const xschool = createdSchool.toObject();
                xschool.photos.push(image);
                School.findOneAndUpdate({_id: xschool._id}, xschool, callback);
              } else {
                callback(err, createdSchool);
              }
              // next(err, province, city, image);
            },
          );
        }
      ],
      (err, callback) => {
        if (err) {
          console.log(err);
        // res.redirect('/');
        }
      },
    );
  },

  deleteSchool(id, callback) {
    School.find({_id: id}).remove(callback);
  },

  editSchool(school, callback) {
    async.waterfall(
      [

        function getProvince(next) {
          provincesController.getProvinceByCode(school.province, (err, province) => {
            next(err, province);
          });
        },
        function getCity(province, next) {
          citiesController.getCityByCode(school.city, (city) => {
            next(null, province, city);
          });
        },
        function getCompany(province, city, next) {
          companiesController.findCompanyById(school.company, (company) => {
            next(null, province, city, company);
          });
        },
        function getOldSchool(province, city, company, next) {
          module.exports.findSchoolById(school.id, (oldSchool) => {
            next(null, province, city, company, oldSchool);
          });
        },
        function updateSchool(province, city, company, oldSchool, next) {
          let newPicture = false;
          const newSchool = {province: province._id, city: city._id, company: company._id};
          if (oldSchool.name !== school.name) {
 newSchool.name = school.name;
}
          if (oldSchool.description !== school.description) {
 newSchool.description = school.description;
}
          if (oldSchool.address !== school.address) {
 newSchool.address = school.address;
}
          if (oldSchool.phone !== school.phone) {
 newSchool.phone = school.phone;
}
          if (oldSchool.website !== school.website) {
 newSchool.website = school.website;
}
          if (oldSchool.schoolType !== school.schoolType) {
 newSchool.schoolType = school.schoolType;
}
          if (oldSchool.pictureUrl !== school.avatarUrl) {
            newSchool.pictureUrl = school.avatarUrl;
            newPicture = true;
          }
          School.findOneAndUpdate({_id: school.id}, newSchool, (err, editedSchool) => {
            if (err) {
              console.log(err);
            } else if (newPicture) {
              next(null, editedSchool);
            } else {
              callback(err, editedSchool);
            }
          });
        },
        function createPicture(editedSchool, next) {
          imagesController.addImage(
            {
              type: 1,
              user: null,
              school: editedSchool,
              description: editedSchool.name,
              url: editedSchool.pictureUrl,
              date: Date.now()
            },
            (err, image) => {
              if (!err) {
                const xschool = editedSchool.toObject();
                xschool.photos.push(image);
                School.findOneAndUpdate({_id: xschool._id}, xschool, callback);
              } else {
                callback(err, editedSchool);
              }
            },
          );
        }

      ],
      (err, callback) => {
        if (err) {
          console.log(err);
        // res.redirect('/');
        }
      },
    );
  },

  updatePictures(school, callback) {
    School.findOneAndUpdate({_id: school._id}, {photos: school.photos}, (err, editedSchool) => {
      callback(err, editedSchool);
    });
  },

  validateSchool(id, callback, validate) {
    let valida = true;
    if (typeof (validate) === 'boolean') {
      valida = validate;
    }
    School.findOneAndUpdate({_id: id}, {validated: valida}, (err, validatedSchool) => {
      callback(err, validatedSchool);
    });
  },

  findSchoolByName(name, callback) {
    School.findOne({name}).exec((err, school) => {
      callback(school);
    });
  },

  findSchoolById(id, callback) {
    School.findOne({_id: id}).populate('province').populate('city').populate('photos')
      .populate('company')
      .exec((err, school) => {
        callback(school);
      });
  },

  findSchoolsByProvince(province, callback) {
    School.find({province}).exec((err, school) => {
      callback(school);
    });
  },

  findSchoolsByCompany(company, callback) {
    School.find({company}).populate('province').populate('city').exec((err, schoolList) => {
      callback(err, schoolList);
    });
  },

  findSchoolsByCompanySortbyRating(company, callback) {
    School.find({company}).sort({averageRating: -1}).populate('province').populate('city')
      .limit('3')
      .exec((err, schoolList) => {
        callback(err, schoolList);
      });
  },

  searchSchools(schoolInfo, prov, city, callback) {
    let searchQueryMessage = '';

    if (prov != -1) { // Province is specified
      provincesController.getProvinceByCode(prov, (err, provModel) => {
        if (!err) {
          if (schoolInfo != '') {
            searchQueryMessage += `"${schoolInfo}" in `;
          }
          searchQueryMessage += `${provModel.name}(${provModel.chineseName})`;

          if (city != -1) { // City is also specified
            citiesController.getCityByCode(city, (cityModel) => {
              searchQueryMessage += `, ${jadeutilityfunctions.capitalize(cityModel.pinyinName)}(${cityModel.chineseName})`;
              School
                .find({name: new RegExp(schoolInfo, 'i')})
                .populate('province')
                .populate('city')
                .where('province')
                .equals(provModel)
                .where('city')
                .equals(cityModel)
                .limit(10)
                .exec((err, schoolList) => {
 callback(schoolList, searchQueryMessage);
});
            });
          } else {
            School
              .find({name: new RegExp(schoolInfo, 'i')})
              .populate('province')
              .populate('city')
              .where('province')
              .equals(provModel)
              .exec((err, schoolList) => {
 callback(schoolList, searchQueryMessage);
});
          }
        } else {
          School // Province and City is not specified
            .find({name: new RegExp(schoolInfo, 'i')})
            .populate('province')
            .populate('city')
            .limit(10)
            .exec((err, schoolList) => {
 callback(schoolList, searchQueryMessage);
});
        }
      });
    } else if (city != -1) {
      citiesController.getCityByCode(city, (cityModel) => {
        if (schoolInfo != '') {
          searchQueryMessage += `"${schoolInfo}" in `;
        }
        searchQueryMessage += `${jadeutilityfunctions.capitalize(cityModel.pinyinName)}(${cityModel.chineseName})`;
        School // Province is not specified
          .find({name: new RegExp(schoolInfo, 'i')})
          .populate('province')
          .populate('city')
          .where('city')
          .equals(cityModel)
          .limit(10)
          .exec((err, schoolList) => {
 callback(schoolList, searchQueryMessage);
});
      });
    } else {
      School // Province and City is not specified
        .find({name: new RegExp(schoolInfo, 'i')})
        .populate('province')
        .populate('city')
        .limit(10)
        .exec((err, schoolList) => {
 callback(schoolList, searchQueryMessage);
});
    }
  },

  emptySchoolCollection() {
    School.remove({}, (err) => {
      console.log('collection removed');
    });
  },

  updateCoverPicture(schoolId, newPictureUrl, callback) {
    School.findOneAndUpdate({_id: schoolId}, {pictureUrl: newPictureUrl}, (err, editedSchool) => {
      if (err) {
        console.log(err);
      }
      callback(editedSchool);
    });
  },

  updateAverageRating(schoolId) {
    reviews.findReviews(schoolId, (reviews) => {
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

      School.findOneAndUpdate({_id: schoolId}, {averageRating: averageScore, criteria}, (err, editedSchool) => {
        if (err) {
          console.log(err);
        }
      });
    });
  }
};
