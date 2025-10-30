import { brandService } from '../services/index.js';

// CREATE Brand
export const createBrand = async (req, res, next) => {
  try {
    const brand = await brandService.createBrand(req.body);
    
    if (!brand) {
      return res.status(409).json({
        error: 'Brand with this name already exists'
      });
    }

    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
};

// GET ALL Brands
export const getAllBrands = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrands();

    res.status(200).json({
      data: brands,
      count: brands.length
    });
  } catch (err) {
    next(err);
  }
};

// GET Brand by ID
export const getBrandById = async (req, res, next) => {
  try {
    const brand = await brandService.findBrandById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found'
      });
    }

    res.status(200).json(brand);
  } catch (err) {
    next(err);
  }
};

// UPDATE Brand
export const updateBrand = async (req, res, next) => {
  try {
    const brand = await brandService.updateBrandById(req.params.id, req.body);

    if (brand === null) {
      return res.status(409).json({
        error: 'Brand name already exists for another brand'
      });
    }

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found'
      });
    }

    res.status(200).json(brand);
  } catch (err) {
    next(err);
  }
};

// DELETE Brand
export const deleteBrand = async (req, res, next) => {
  try {
    const brand = await brandService.deleteBrandById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found'
      });
    }

    res.status(200).json({
      message: 'Brand deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
