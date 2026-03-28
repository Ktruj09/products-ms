import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductoService');

  constructor(private prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    this.logger.log(`Create product `);
    const product = await this.prismaService.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.prismaService.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalPages / limit);
    return {
      data: await this.prismaService.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true,
        },
      }),
      metadata: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: id,
        available: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;
    await this.findOne(id);

    return this.prismaService.product.update({
      where: { id: id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.prismaService.product.update({
      where: { id: id },
      data: {
        available: false,
      },
    });

    return product;
  }
}
