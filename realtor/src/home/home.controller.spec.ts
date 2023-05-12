import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockHome = {
  id: 1,
  address: '234 william str',
  city: 'Toronto',
  price: 1500,
  propertyType: PropertyType.RESIDENTIAL,
  image: 'img1',
  number_of_bedrooms: 3,
  number_of_bathrooms: 2,
};
const mockUser = {
  id: 53,
  name: 'Laith',
  email: 'laith@laith.com',
  phone: '555 555',
};
describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });
  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', '15000');
      expect(mockGetHomes).toBeCalledWith({
        city: 'Toronto',
        price: {
          gte: 15000,
        },
      });
    });
  });
  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Laith',
      id: 30,
      iat: 1,
      exp: 2,
    };
    const mockUpdateHomeParam = {
      address: '111 tww',
      numberOfBathrooms: 2,
      numberOfBedrooms: 3,
      city: 'Vancouver',
      landSize: 444,
      price: 3000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ],
    };
    it('should throw unauth error if realtor did not create home', async () => {
      await expect(
        controller.updateHome(5, mockUpdateHomeParam, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });
    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);
      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);
      await controller.updateHome(5, mockUpdateHomeParam, {
        ...mockUserInfo,
        id: 53,
      });
      expect(mockUpdateHome).toBeCalled();
    });
  });
});
