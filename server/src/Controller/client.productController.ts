import { Request, Response } from "express";
import { db } from "../db/index.js";
import { products, productStocks, productTags, tags } from "../db/schema/category.js";
import { eq, desc, inArray } from "drizzle-orm";
import fs from "fs";


export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const allProducts = await db.query.products.findMany({
            with: {
                stock: true,
                productTags: true
            },
            orderBy: [desc(products.createdAt)],
        });

        // Map to include tags at top level
        const formattedData = allProducts.map(p => ({
            ...p,
            quantity: p.stock?.quantity || 0,
            tags: p.productTags.map(pt => pt.tagId)
        }));

        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
