// This file defines the "shape" of our general.json data for TypeScript

export interface ApiResponse {
  response: string;
  content:  ProjectContent;
  content2: null;
  content3: null;
  pagination: null;
}

export interface ProjectContent {
  id:                 number;
  projectName:        string;
  projectShortName:   string;
  currency:           string;
  countryCode:        string;
  phoneNo:            string;
  tenure:             string;
  propertyCategory:   string;
  propertyType:       string[];
  sizeUnit:           string;
  address1:           string;
  address2:           string;
  address3:           string;
  country:            string;
  state:              string;
  city:               string;
  postalCode:         string;
  longitude:          string;
  latitude:           string;
  descriptionTitle:   string;
  descriptionSubTitle: string;
  descriptionOverview: string;
  logo:               string;
  sitePlan:           null;
  landSize:           number;
  metricUnit:         null;
  bumiDiscount:       null;
  totalUnit:          number;
  showStoreyPlan:     boolean;
  showSitePlan:       boolean;
  email:              string;
  projectDetails:     ProjectDetail[];
  propertyInfo:       any[]; // Assuming empty or unknown structure
  gallery:            any[]; // Assuming empty or unknown structure
  layouts:            any[]; // Assuming empty or unknown structure
  documents:          any[]; // Assuming empty or unknown structure
  map:                any[]; // Assuming empty or unknown structure
}

export interface ProjectDetail {
  id:              number;
  metId:           number;
  type:            string;
  name:            string;
  description:     string;
  param1:          string;
  status:          number;
  createdDatetime: string;
  updatedDatetime: string;
  imageUrl:        string;
}