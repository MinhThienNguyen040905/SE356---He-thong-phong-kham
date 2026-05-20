import { Router } from "express";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from "./shiftTemplate.controller";
import { verifyToken } from "../../middlewares/auth.middlewares";
import { requireRole } from "../../middlewares/roleCheck.middlewares";
import { RoleCode } from "../../constant/role";
import { validateNumericId } from "../../middlewares/validators/common.validators";
import { cacheMiddleware, clearCache } from "../../middlewares/cache.middlewares";

const router = Router();

const SHIFT_TEMPLATE_TTL = 10 * 60 * 1000;

const invalidateShiftTemplateCache = (req: any, _res: any, next: any) => {
  clearCache(":/shift-templates");
  next();
};


router.use(verifyToken);


router.post("/", requireRole(RoleCode.ADMIN), invalidateShiftTemplateCache, createTemplate);
router.put(
  "/:id",
  requireRole(RoleCode.ADMIN),
  validateNumericId("id"),
  invalidateShiftTemplateCache,
  updateTemplate
);
router.delete(
  "/:id",
  requireRole(RoleCode.ADMIN),
  validateNumericId("id"),
  invalidateShiftTemplateCache,
  deleteTemplate
);


router.get("/", cacheMiddleware(SHIFT_TEMPLATE_TTL), getTemplates);
router.get("/:id", validateNumericId("id"), cacheMiddleware(SHIFT_TEMPLATE_TTL), getTemplateById);

export default router;
