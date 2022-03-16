export interface AboutDataType {
  data: {
    profile: ProfileType;
    social: SocialType;
  };
}
export interface SocialType {
  name: string;
  url: string;
}
export interface ProfileType {
  about: string;
  name: string;
  profession: string;
}
