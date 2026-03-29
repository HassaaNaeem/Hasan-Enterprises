import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Map fieldname to cloudinary folder
const getFolderByFieldname = (fieldname) => {
  const folders = {
    plotMap: "hasan-enterprises/plotMap",
    cnicCopy: "hasan-enterprises/cnicCopy",
    bankStatement: "hasan-enterprises/bankStatement",
    companyForm: "hasan-enterprises/companyForm",
    image: "hasan-enterprises/image",
    paymentProof: "hasan-enterprises/paymentProof",
    document: "hasan-enterprises/documents",
    plotImage: "hasan-enterprises/plots",
  };
  return folders[fieldname] || "hasan-enterprises/misc";
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = ["image/jpeg", "image/png", "image/gif"].includes(
      file.mimetype,
    );

    return {
      folder: getFolderByFieldname(file.fieldname),
      resource_type: isImage ? "image" : "raw", // 'raw' for PDFs/docs
      allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, PDF, and DOC files are allowed.",
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export const uploadFields = upload.fields([
  { name: "plotMap", maxCount: 1 },
  { name: "cnicCopy", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "companyForm", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "paymentProof", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "plotImage", maxCount: 1 },
]);

export default cloudinary;
