const Company = require('../models/company');
const imagesController = require('./images');
const async = require('async');

module.exports = {

  getAllCompanies(callback) {
    Company.find().exec((err, companyList) => {
      if (err) {
        console.log(err);
      } else {
        callback(companyList);
      }
    });
  },

  findCompanyById(id, callback) {
    Company.findOne({_id: id}).populate('photos').exec((err, company) => {
      if (err) {
        console.log(err);
      } else {
        callback(company);
      }
    });
  },

  editCompany(company, callback) {
    Company.findOneAndUpdate({_id: company.id}, company, (err, editedCompany) => {
      callback(err, editedCompany);
    });
  },

  addCompany(company, callback) {
    async.waterfall([
      // 1)Create the company
      async.apply((company, callback, done) => {
        Company.create({
          name: company.name,
          description: company.description,
          website: company.website,
          pictureUrl: company.pictureUrl,
          logoUrl: company.logoUrl,
        }, (err, createdCompany) => {
          if (!err) {
            done(err, createdCompany, callback);
          }
        });
      }, company, callback),

      // 2)Create the logo image
      function createLogoImage(createdCompany, callback, done) {
        imagesController.addImage({
          type: 4,
          user: null,
          school: null,
          description: createdCompany.name,
          url: createdCompany.logoUrl,
          date: Date.now(),
        }, (err, logoImage) => {
          done(err, createdCompany, logoImage, callback);
        });
      },

      // 3)Create the cover image
      function createCoverImage(createdCompany, logoImage, callback, done) {
        imagesController.addImage({
          type: 3,
          user: null,
          school: null,
          description: createdCompany.name,
          url: createdCompany.pictureUrl,
          date: Date.now(),
        }, (err, coverImage) => {
          done(err, createdCompany, logoImage, coverImage, callback);
        });
      },

      // 4)Push the images to company array
      function pushImagestoArray(createdCompany, logoImage, coverImage, callback, done) {
        const newCompany = createdCompany.toObject();
        newCompany.photos.push(logoImage);
        newCompany.photos.push(coverImage);
        Company.findOneAndUpdate({_id: newCompany._id}, newCompany, done);
      },

      function finish(newCompany) {
        callback(newCompany);
      },

    ], (err) => {
      if (err) console.log(err);
      // res.redirect('/');
    });
  },
};

