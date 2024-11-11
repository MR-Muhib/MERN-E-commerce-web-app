const fs = require("fs").promises;

const deleteImage = async (userImagePath) => {
  try {
    await fs.access(userImagePath); // Check if image file exists
    await fs.unlink(userImagePath); // Delete the image file
    console.log("User image was deleted");
  } catch (error) {
    console.warn(`Image file does not exist at path: ${userImagePath}`);
  }
};

module.exports = { deleteImage };
