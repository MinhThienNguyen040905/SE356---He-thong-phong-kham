import { Router } from "express";
import {
  getAllSpecialties,
  getDoctorsBySpecialty,
  getSpecialtyById,
  updateSpecialtyById,
} from "./doctor.controller";
import { validateNumericId } from "../../middlewares/validators/common.validators";
import { verifyToken } from "../../middlewares/auth.middlewares";
import { requireRole } from "../../middlewares/roleCheck.middlewares";
import { RoleCode } from "../../constant/role";
import { cacheMiddleware, clearCache } from "../../middlewares/cache.middlewares";

const router = Router();

const SPECIALTY_TTL = 10 * 60 * 1000;

router.get("/", cacheMiddleware(SPECIALTY_TTL), getAllSpecialties);


router.get("/:id", validateNumericId("id"), cacheMiddleware(SPECIALTY_TTL), getSpecialtyById);


router.get("/:id/doctors", validateNumericId("id"), cacheMiddleware(SPECIALTY_TTL), getDoctorsBySpecialty);


router.use(verifyToken);
router.put(
  "/:id",
  validateNumericId("id"),
  requireRole(RoleCode.ADMIN),
  (req, _res, next) => {
    clearCache(":/specialties");
    next();
  },
  updateSpecialtyById
);

export default router;
