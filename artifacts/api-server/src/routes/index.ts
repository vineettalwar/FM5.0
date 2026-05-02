import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import stationsRouter from "./stations.js";
import genresRouter from "./genres.js";
import countriesRouter from "./countries.js";
import favoritesRouter from "./favorites.js";
import historyRouter from "./history.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stationsRouter);
router.use(genresRouter);
router.use(countriesRouter);
router.use(favoritesRouter);
router.use(historyRouter);

export default router;
