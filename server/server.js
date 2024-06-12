import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Sequelize, DataTypes } from "sequelize";

const app = express();
app.use(express.json());
app.use(cors());

cloudinary.config({
  cloud_name: "dgzbpko6w",
  api_key: "972859984146584",
  api_secret: "I6bTJ9Mj_Y0iLZ-qTu2upQS-7OE",
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sequelize = new Sequelize("sys", "root", "raju@8790", {
  dialect: "mysql",
  host: "127.0.0.1",
  logging: false,
});

const Pdf = sequelize.define("Pdf", {
  pdfUrl: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize
  .sync()
  .then(() => {
    console.log("Table created successfully");
  })
  .catch((error) => {
    console.error("Error creating table:", error);
  });

app.post("/upload-files", upload.array("files"), async (req, res) => {
  try {
    let imageUrl;
    const { name, email, phoneNumber } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No files were uploaded" });
    }

    const promises = files.map(async (file) => {
      const { buffer } = file;
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_size: "raw" }, (error, result) => {
            if (error) {
              console.error("Error uploading to Cloudinary:", error);
              reject(error);
            } else {
              resolve(result);
            }
          })
          .end(buffer);
      });
      return result.secure_url;
    });

    const uploadedUrls = await Promise.all(promises);

    imageUrl = uploadedUrls;

    const pdfEntry = await Pdf.create({
      pdfUrl: imageUrl,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
    });

    res.json({ status: "success", message: "Files uploaded successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.get("/pdf-files", async (req, res) => {
  try {
    const pdfEntries = await Pdf.findAll();
    res.json(pdfEntries);
  } catch (error) {
    console.error("Error fetching PDF entries:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

const PORT = 8002;
app.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
