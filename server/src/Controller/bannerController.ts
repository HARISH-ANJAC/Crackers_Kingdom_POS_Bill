import { Request, Response } from "express";
import { db } from "../db/index.js";
import { banners } from "../db/schema/category.js";
import { eq, desc } from "drizzle-orm";
import fs from "fs";

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, description, badge, badgeIcon, ctaText, ctaLink, rank, isActive } = req.body;
    const image = req.file ? req.file.path : null;

    if (!image) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const newBanner = await db.insert(banners).values({
      title,
      description,
      badge,
      badgeIcon,
      image,
      ctaText,
      ctaLink,
      rank: rank ? parseInt(rank) : 0,
      isActive: isActive === 'true' || isActive === true,
    }).returning();

    res.status(201).json({
      success: true,
      data: newBanner[0],
      message: "Banner created successfully",
    });
  } catch (error: any) {
    console.error("Error in createBanner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const allBanners = await db.select().from(banners).orderBy(banners.rank, desc(banners.createdAt));
    res.status(200).json({ success: true, data: allBanners });
  } catch (error: any) {
    console.error("Error in getAllBanners:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBannerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await db.select().from(banners).where(eq(banners.id, id as any));
    
    if (banner.length === 0) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, data: banner[0] });
  } catch (error: any) {
    console.error("Error in getBannerById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, badge, badgeIcon, ctaText, ctaLink, rank, isActive } = req.body;
    
    // Check if banner exists
    const existingBannerArr = await db.select().from(banners).where(eq(banners.id, id as any));
    if (existingBannerArr.length === 0) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const existingBanner = existingBannerArr[0];
    let image = existingBanner.image;

    if (req.file) {
      // Delete old image if exists
      if (image && fs.existsSync(image)) {
        fs.unlinkSync(image);
      }
      image = req.file.path;
    }

    const updatedBanner = await db.update(banners)
      .set({
        title,
        description,
        badge,
        badgeIcon,
        image,
        ctaText,
        ctaLink,
        rank: rank !== undefined ? parseInt(rank) : undefined,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, id as any))
      .returning();

    res.status(200).json({
      success: true,
      data: updatedBanner[0],
      message: "Banner updated successfully",
    });
  } catch (error: any) {
    console.error("Error in updateBanner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedBanner = await db.delete(banners)
      .where(eq(banners.id, id as any))
      .returning();

    if (deletedBanner.length === 0) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Delete image file if exists
    if (deletedBanner[0].image && fs.existsSync(deletedBanner[0].image)) {
      fs.unlinkSync(deletedBanner[0].image);
    }

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteBanner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
