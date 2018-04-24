const Company = require('../models/company');
const imagesController = require('./images');

module.exports = {

  getAllCompanies() {
    return Company.find().exec();
  },

  findCompanyById(id) {
    return Company.findOne({_id: id}).populate('photos').exec();
  },

  editCompany(company) {
    return Company.findOneAndUpdate({_id: company.id}, company).exec();
  },

  countSchoolsPerCompany(companyId) {
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

