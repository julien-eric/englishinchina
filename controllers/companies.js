const Company = require('../models/company');
const imagesController = require('./images');
const mongoose = require('mongoose');
const _ = require('underscore');
const ObjectId = mongoose.Types.ObjectId;

let unpluck = function(array) {
  return _.filter(array, function(element) {
    return Object.getOwnPropertyNames(element).length != 0;
  });
};

module.exports = {

  getAllCompanies() {
    return Company.find().exec();
  },

  findCompanyById(id) {
    return Company.findOne({_id: id}).populate('photos').exec();
  },

  async findCompanyWithSchoolsAndReviews(id) {

    let companies = await Company.aggregate([
      {
        $match: {_id: ObjectId(id)}
      },
      { // Left Join with schools
        $lookup:
          {
            from: 'schools',
            localField: '_id',
            foreignField: 'company',
            as: 'schools'
          }
      },
      {
        $unwind: {
          path: '$schools',
          preserveNullAndEmptyArrays: true
        }
      },
      { // Left Join with reviews
        $lookup:
          {
            from: 'reviews',
            localField: 'schools._id',
            foreignField: 'foreignId',
            as: 'reviews'
          }
      },
      {
        $unwind: {
          path: '$reviews',
          preserveNullAndEmptyArrays: true
        }
      },
      { // Left Join with users
        $lookup:
          {
            from: 'users',
            localField: 'reviews.user',
            foreignField: '_id',
            as: 'reviews.user'
          }
      },
      {
        $unwind: {
          path: '$reviews.user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          name: {$first: '$name'},
          description: {$first: '$description'},
          website: {$first: '$website'},
          pictureUrl: {$first: '$pictureUrl'},
          logoUrl: {$first: '$logoUrl'},
          photos: {$first: '$photos'},
          schools: {$addToSet: '$schools'},
          reviews: {$addToSet: '$reviews'}
        }
      }
    ]).exec();

    // TODO Find a DB way to not have empty reviews without also unplucking 0 review schools
    let company = companies[0];
    company.reviews = unpluck(company.reviews);
    return company;
  },

  findCompaniesWithSchoolsAndReviews(id) {
    return Company.aggregate([
      {
        $lookup:
          {
            from: 'schools',
            localField: '_id',
            foreignField: 'company',
            as: 'schools'
          }
      },
      {
        $unwind: {
          path: '$schools',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup:
          {
            from: 'reviews',
            localField: 'schools._id',
            foreignField: 'foreignId',
            as: 'reviews'
          }
      },
      {
        $unwind: {
          path: '$reviews',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          name: {$first: '$name'},
          description: {$first: '$description'},
          website: {$first: '$website'},
          pictureUrl: {$first: '$pictureUrl'},
          logoUrl: {$first: '$logoUrl'},
          photos: {$first: '$photos'},
          schools: {$addToSet: '$schools'},
          reviews: {$addToSet: '$reviews'}
        }
      }
    ]).exec();
  },

  editCompany(company) {
    return Company.findOneAndUpdate({_id: company.id}, company).exec();
  },

  async searchCompanies(companyInfo) {

    let transactions = Company.aggregate([
      {$match: {name: new RegExp(companyInfo, 'i')}},
      {$sort: {number: -1}},
      {
        $lookup:
          {
            from: 'schools',
            localField: '_id',
            foreignField: 'company',
            as: 'schools'
          }
      }
    ]);

    let companies = await transactions.exec();
    return {list: companies, query: companyInfo, searchInfo: {companyInfo: companyInfo}};
  },

  findCompaniesWithSchools() {
    return Company.aggregate([
      {
        $lookup:
          {
            from: 'schools',
            localField: '_id',
            foreignField: 'company',
            as: 'schools'
          }
      }
    ]).exec();
  },

  async addCompany(company) {

    try { // First create company then add images

      let createdCompany = await Company.create({
        name: company.name,
        description: company.description,
        website: company.website,
        pictureUrl: company.pictureUrl,
        logoUrl: company.logoUrl
      });

      let logoImage = await imagesController.addImage({
        type: 4,
        user: null,
        school: null,
        description: createdCompany.name,
        url: createdCompany.logoUrl,
        date: Date.now()
      });

      let coverImage = await imagesController.addImage({
        type: 3,
        user: null,
        school: null,
        description: createdCompany.name,
        url: createdCompany.pictureUrl,
        date: Date.now()
      });

      const newCompany = createdCompany.toObject();
      newCompany.photos.push(logoImage);
      newCompany.photos.push(coverImage);
      return Company.findOneAndUpdate({_id: newCompany._id}, newCompany);

    } catch (error) {
      return error;
    }
  }
};



