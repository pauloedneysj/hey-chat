import userResolvers from './User/resolvers'
import merge from 'lodash.merge';

const resolvers = merge({}, userResolvers);

export default resolvers;