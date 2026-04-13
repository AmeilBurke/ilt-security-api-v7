import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import * as fs from "fs";
import sharp from "sharp";
import { BannedPerson } from "@/generated/prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { StaffPayload } from "@/utils/types";
import { CreateAlertDto } from "./dto/create-alert.dto";

@Injectable()
export class AlertsService {
	constructor(private prisma: PrismaService) { }

	async create(
		baseUrl: string,
		staff: StaffPayload,
		createAlertDto: CreateAlertDto,
		file?: Express.Multer.File,
	) {
		const requestAccount = await this.prisma.staff.findUniqueOrThrow({
			where: { id: staff.id },
		});

		if (!file && !createAlertDto.personId) {
			throw new BadRequestException("No image or banned persons id was given");
		}

		if (file) {
			try {
				await sharp(file.path)
					.webp({ quality: 75 })
					.toFile(`uploads/compressed/alerts/${file.filename}.webp`);

				await fs.promises.unlink(file.path);
			} catch (error) {
				await fs.promises.unlink(file.path).catch(() => { });
				throw new InternalServerErrorException("Image processing failed");
			}
		}

		let bannedPerson: undefined | BannedPerson;

		if (createAlertDto.personId) {
			bannedPerson = await this.prisma.bannedPerson.findUniqueOrThrow({
				where: {
					id: createAlertDto.personId,
				},
			});
		}

		const result = await this.prisma.alert.create({
			data: {
				reason: createAlertDto.reason,
				imagePath: file ? `${file.filename}.webp` : bannedPerson?.imagePath,
				createdById: requestAccount.id,
			},
		});

		return {
			...result,
			imagePath: `${baseUrl}/uploads/compressed/alerts/${result.imagePath}`,
		};
	}

	async findAll(baseUrl: string) {
		const alerts = await this.prisma.alert.findMany({
			include: {
				createdBy: {
					select: {
						name: true
					}
				}
			}
		});
		return alerts.map((alert) => {
			return {
				...alert,
				imagePath: `${baseUrl}/uploads/compressed/alerts/${alert.imagePath}`,
			};
		});
	}

	async removeAll() {
		await this.prisma.alert.deleteMany()
		return 'deleted all alerts'
	}
}
