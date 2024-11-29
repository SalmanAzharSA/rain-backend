const questionService = require("../pools/pool.services");

exports.deleteImage = async (deleteImageDto, result = {}) => {
  try {
    const response = await questionService.deleteImage(deleteImageDto);

    if (response.ex) throw response.ex;

    result.data = response.ImageDeleteSuccess;
  } catch (ex) {
    result.ex = ex;
  } finally {
    return result;
  }
};
