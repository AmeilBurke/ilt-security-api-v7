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
import path from "path";

@Injectable()
export class AlertsService {
	constructor(private prisma: PrismaService) { }

	private readonly ALERT_IMAGE_FOLDER = path.join(process.cwd(), 'uploads', 'compressed', 'alerts');
	private readonly URL_ALERT_IMAGE = '/uploads/compressed/alerts/'

	async create(
		baseUrl: string,
		staff: StaffPayload,
		createAlertDto: CreateAlertDto,
		file?: Express.Multer.File,
	) {
		if (!file && !createAlertDto.personId) {
			throw new BadRequestException("No image or banned person id was given");
		}

		let imagePath: string | undefined;

		if (file) {
			try {
				const webpFilename = `${file.filename}.webp`;
				await sharp(file.path).webp({ quality: 75 }).toFile(path.join(this.ALERT_IMAGE_FOLDER, webpFilename));
				imagePath = webpFilename;
			} finally {
				await fs.promises.unlink(file.path).catch(() => { });
			}
		}

		if (createAlertDto.personId) {
			const bannedPerson = await this.prisma.bannedPerson.findUniqueOrThrow({
				where: { id: createAlertDto.personId },
				select: { imagePath: true },
			});


			if (!imagePath) {
				imagePath = bannedPerson.imagePath ?? undefined;
			}
		}

		if (!imagePath) {
			throw new BadRequestException("No image could be resolved for this alert");
		}

		const result = await this.prisma.alert.create({
			data: {
				reason: createAlertDto.reason,
				imagePath: imagePath,
				personId: createAlertDto.personId,
				createdById: staff.id,
			},
		});

		return {
			...result,
			imagePath: `${baseUrl}${this.URL_ALERT_IMAGE}${result.imagePath}`,
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

		const allAlerts = alerts.map((alert) => {
			if (alert.personId) {
				return {
					...alert,
					imagePath: `${baseUrl}/uploads/compressed/people/${alert.imagePath}`,
				};
			} else {
				return {
					...alert,
					imagePath: `${baseUrl}/uploads/compressed/alerts/${alert.imagePath}`,
				};
			}
		});

		// console.log(allAlerts)

		return allAlerts
	}

	async removeOneById(id: string): Promise<string> {
		const alertToDelete = await this.prisma.alert.findUniqueOrThrow({
			where: { id },
			select: {
				personId: true,
				imagePath: true
			},
		});

		if (!alertToDelete.personId) {
			await fs.promises.rm(
				path.join(this.ALERT_IMAGE_FOLDER, alertToDelete.imagePath)
			);
		}

		await this.prisma.alert.delete({ where: { id } });
		return 'Deleted alert'
	}

	// need to add cronjob for deleting these at 6am
	async removeAll(): Promise<string> {
		const alertsWithImages = await this.prisma.alert.findMany({
			where: { personId: null },
			select: { imagePath: true },
		});

		const deletionResults = await Promise.allSettled(
			alertsWithImages.map(({ imagePath }) =>
				fs.promises.rm(path.join(this.ALERT_IMAGE_FOLDER, imagePath), { force: true })
			)
		);

		const failedDeletions = deletionResults.filter((r) => r.status === "rejected");
		if (failedDeletions.length > 0) {
			console.warn(`Failed to delete ${failedDeletions.length} image(s):`, failedDeletions);
		}

		const { count } = await this.prisma.alert.deleteMany();

		return `Deleted ${count} alerts`;
	}
}
