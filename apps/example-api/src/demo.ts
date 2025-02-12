import prisma from "./prisma.js";

export class DemoController {


    get(req: Request, res: Response) {
        prisma.user.findMany({
          where: {

          }
        })
    }
}
