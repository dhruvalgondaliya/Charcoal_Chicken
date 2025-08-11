
const DeliveryInfoSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  City: {
    type: String,
    required: true,
  },
  ZIPCode: {
    type: String,
    required: true,
  },
});
