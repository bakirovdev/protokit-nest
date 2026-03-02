import { Global, Module } from "@nestjs/common";
import { IsUniqueConstraint } from "./is-unique.validator";
import { IsExistConstraint } from "./is-exist.validator";
import { PrismaModule } from "@src/prisma/prisma.module";
import { IsHierarchyConstraint } from "./is-hierarchy.validator";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    IsUniqueConstraint,
    IsExistConstraint,
    IsHierarchyConstraint
  ],
  exports: [
    IsUniqueConstraint,
    IsExistConstraint,
    IsHierarchyConstraint
  ],
})
export class ValidatorsModule {}