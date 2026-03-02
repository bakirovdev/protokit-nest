import { Injectable } from "@nestjs/common";
import { RequestContextService } from "@src/base/middlewares/request-context/request-context.service";
import { PrismaService } from "@src/prisma/prisma.service";

@Injectable()
export class HierarchyService {
    constructor(private readonly prisma: PrismaService) { }

    async getRelatedCompanyIds(companyId?: number): Promise<number[]> {        
        if (!companyId) {                        
            const auth = RequestContextService.getAuth();
            companyId = auth?.company_id as number;
        };

        const companyIds = new Set<number>();
        companyIds.add(companyId);

        // Get parent
        const parentId = await this.getParentCompanyId(companyId);
        if (parentId) {
        companyIds.add(parentId);
        }

        // Get all children recursively
        const childIds = await this.getDescendantCompanyIds(companyId);
        childIds.forEach(id => companyIds.add(id));

        return Array.from(companyIds);
    }

    async getParentCompanyId(companyId?: number): Promise<number | null> 
    {        
        if (!companyId) {
            const auth = RequestContextService.getAuth();            
            companyId = auth?.company_id as number;
        }      

        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { parent_id: true },
        });

        if (!company?.parent_id) {
            return companyId;
        }

        return company.parent_id;
    }

    async getDescendantCompanyIds(companyId: number|null = null): Promise<number[]> {
        if (!companyId) {                        
            companyId = RequestContextService.getAuth()?.company_id as number;                        
        };
                
        const result: number[] = companyId ? [companyId] : [];
                
        const recurse = async (ids: number[]) => {
            const children = await this.prisma.company.findMany({
                where: { parent_id: { in: ids ? ids : [] } },
                select: { id: true },
            });

            if (children.length > 0) {
                const childIds = children.map(c => c.id);
                result.push(...childIds);
                await recurse(childIds);
            }
        };

        await recurse(result);
        return result;
    }

    async getWithParent(companyId: number|null = null): Promise<number[]> 
    {
        if (!companyId) {                        
            companyId = RequestContextService.getAuth()?.company_id as number;
        };
                                        
        const parent = await this.prisma.company.findFirst({
            where: {
                parent_id: companyId
            }
        });
        
        if (parent) {
            if (companyId) return [companyId, parent.id]
            return [parent.id]
        }
        
        return companyId ? [companyId]: [];
    }
}